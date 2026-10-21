import { create } from "zustand";
import { persist } from "zustand/middleware";

let isLogging = false;

// Custom Middleware to monitor and log cart actions (Experiment 2 requirement e)
const cartActionLoggerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      const prevState = get();
      set(...args);
      const nextState = get();

      // Guard against recursive logging calls
      if (isLogging) return;

      const prevCount = prevState?.cart?.reduce((n, i) => n + (i.quantity || 0), 0) ?? 0;
      const nextCount = nextState?.cart?.reduce((n, i) => n + (i.quantity || 0), 0) ?? 0;
      const totalItems = nextState?.cart?.length ?? 0;

      let actionName = "CART_ACTION";
      if (typeof args[0] === "function") {
        actionName = "STATE_UPDATE";
      } else if (args[0]?.type) {
        actionName = args[0].type;
      }

      const logEntry = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        prevCartCount: prevCount,
        nextCartCount: nextCount,
        totalItems: totalItems,
        action: actionName,
        payload: typeof args[0] === "object" ? args[0] : { fn: "reducer_function" }
      };

      console.groupCollapsed(
        `%c[Cart Middleware]%c ${actionName} at ${logEntry.timestamp}`,
        "color: #3b82f6; font-weight: bold;",
        "color: #64748b;"
      );
      console.log("Log Details:", logEntry);
      console.groupEnd();

      // Safely update actionLogs without infinite recursion
      try {
        isLogging = true;
        set({ actionLogs: [logEntry, ...(nextState.actionLogs || [])].slice(0, 20) });
      } catch (err) {
        // fail silently for logger
      } finally {
        isLogging = false;
      }
    },
    get,
    api
  );

export const useCartStore = create(
  persist(
    cartActionLoggerMiddleware((set, get) => ({
      cart: [],
      discountCode: "",
      discountPercent: 0,
      discountMessage: "",
      actionLogs: [],

      // Exp 2 b: addToCart()
      addToCart: (product, qty = 1) => {
        set((state) => {
          const currentCart = state.cart || [];
          const existing = currentCart.find((item) => item.id === product.id);
          let updatedCart;
          if (existing) {
            updatedCart = currentCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + qty }
                : item
            );
          } else {
            updatedCart = [...currentCart, { ...product, quantity: qty }];
          }
          return {
            cart: updatedCart,
            type: `addToCart(${product.title.slice(0, 18)}... x${qty})`
          };
        });
      },

      // Exp 2 b: removeFromCart()
      removeFromCart: (productId) => {
        set((state) => ({
          cart: (state.cart || []).filter((item) => item.id !== productId),
          type: `removeFromCart(ID: ${productId})`
        }));
      },

      // Exp 2 b: updateQuantity()
      updateQuantity: (productId, delta) => {
        set((state) => {
          const updated = (state.cart || [])
            .map((item) => {
              if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean);
          return {
            cart: updated,
            type: `updateQuantity(ID: ${productId}, delta: ${delta > 0 ? "+" + delta : delta})`
          };
        });
      },

      // Exp 2 b: clearCart()
      clearCart: () => {
        set({
          cart: [],
          discountCode: "",
          discountPercent: 0,
          discountMessage: "",
          type: "clearCart()"
        });
      },

      // Apply coupon code for discount
      applyCoupon: (code) => {
        const upper = (code || "").trim().toUpperCase();
        if (upper === "SAVE10") {
          set({
            discountCode: "SAVE10",
            discountPercent: 10,
            discountMessage: "10% Discount Applied!",
            type: "applyCoupon(SAVE10)"
          });
          return { success: true, message: "10% Discount applied successfully!" };
        } else if (upper === "SUPER20") {
          set({
            discountCode: "SUPER20",
            discountPercent: 20,
            discountMessage: "20% Super Saver Applied!",
            type: "applyCoupon(SUPER20)"
          });
          return { success: true, message: "20% Discount applied successfully!" };
        } else {
          return { success: false, message: "Invalid coupon. Try 'SAVE10' or 'SUPER20'." };
        }
      },

      removeCoupon: () => {
        set({
          discountCode: "",
          discountPercent: 0,
          discountMessage: "",
          type: "removeCoupon()"
        });
      },

      clearLogs: () => set({ actionLogs: [] })
    })),
    {
      name: "jexocart_cart_zustand", // Exp 2 f: Persist cart in browser storage
      partialize: (state) => ({
        cart: state.cart || [],
        discountCode: state.discountCode,
        discountPercent: state.discountPercent
      })
    }
  )
);

// Helper selector functions for calculations (Exp 2 d)
export const calculateCartTotals = (cart = [], discountPercent = 0) => {
  const safeCart = cart || [];
  const subtotal = safeCart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const discount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discount;
  const deliveryCharge = subtotal === 0 || afterDiscount >= 50 ? 0 : 4.99;
  const finalAmount = subtotal === 0 ? 0 : Math.max(0, afterDiscount + deliveryCharge);

  return {
    subtotal,
    discount,
    deliveryCharge,
    finalAmount,
    totalQuantity: safeCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  };
};
