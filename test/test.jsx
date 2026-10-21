import React, { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ProductCard from "../src/components/ProductCard";
import ShopView from "../src/components/ShopView";
import CartView from "../src/components/CartView";
import CheckoutView from "../src/components/CheckoutView";
import { api, getToken } from "../src/api";
import { useCartStore } from "../src/store/useCartStore";
import { getSafeProductImageUrl } from "../src/utils/productImage";

jest.mock("../src/api", () => ({
  api: { get: jest.fn() },
  getToken: jest.fn()
}));

const product = {
  id: 1,
  title: "Canvas Backpack",
  category: "bags",
  price: 24.5,
  image: "backpack.jpg",
  rating: { rate: 4.5, count: 12 }
};

const cartItem = { ...product, price: 20, quantity: 2 };
const products = [
  product,
  { id: 2, title: "Cotton T-Shirt", category: "clothing", price: 15, rating: { rate: 3.8, count: 8 } },
  { id: 3, title: "Travel Bag", category: "bags", price: 45, rating: { rate: 4.2, count: 6 } }
];

const silenceCartLogging = () => {
  jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "groupEnd").mockImplementation(() => {});
};

const ShopHarness = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <ShopView
      products={products}
      loading={false}
      error=""
      search={search}
      setSearch={setSearch}
      category={category}
      setCategory={setCategory}
      onAdd={jest.fn()}
      onViewDetails={jest.fn()}
      onOpenCreate={jest.fn()}
      onEditProduct={jest.fn()}
      onDeleteProduct={jest.fn()}
      isLoggedIn
      onRetry={jest.fn()}
    />
  );
};

describe("ProductCard", () => {
  beforeEach(() => {
    useCartStore.setState({ cart: [] });
    silenceCartLogging();
  });

  afterEach(() => jest.restoreAllMocks());

  test("renders product details and formatted price", () => {
    render(
      <ProductCard
        product={product}
        onAdd={jest.fn()}
        onViewDetails={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoggedIn
      />
    );

    expect(screen.getByRole("heading", { name: "Canvas Backpack" })).toBeInTheDocument();
    expect(screen.getByText("bags")).toBeInTheDocument();
    expect(screen.getByText("$24.50")).toBeInTheDocument();
    expect(screen.getByText("★ 4.5")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Canvas Backpack" })).toHaveAttribute("src", "backpack.jpg");
  });

  test("calls detail, edit, and delete handlers from their controls", () => {
    const onViewDetails = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ProductCard
        product={product}
        onAdd={jest.fn()}
        onViewDetails={onViewDetails}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoggedIn={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /quick view/i }));
    fireEvent.click(screen.getByRole("button", { name: "View details for Canvas Backpack" }));
    fireEvent.click(screen.getByTitle("Edit Product (Exp 3 PUT)"));
    fireEvent.click(screen.getByTitle("Delete Product (Exp 3 DELETE)"));

    expect(onViewDetails).toHaveBeenNthCalledWith(1, product.id);
    expect(onViewDetails).toHaveBeenNthCalledWith(2, product.id);
    expect(onEdit).toHaveBeenCalledWith(product);
    expect(onDelete).toHaveBeenCalledWith(product);
    expect(screen.getByRole("button", { name: "Login to add" })).toBeInTheDocument();
  });

  test("adds the selected product to the cart", () => {
    render(
      <ProductCard
        product={product}
        onAdd={(selectedProduct) => useCartStore.getState().addToCart(selectedProduct)}
        onViewDetails={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoggedIn
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(useCartStore.getState().cart).toEqual([{ ...product, quantity: 1 }]);
  });

  test("uses a local fallback for unsafe or missing image URLs", () => {
    expect(getSafeProductImageUrl("javascript:alert(1)")).toBe("/product-placeholder.svg");
    expect(getSafeProductImageUrl("")).toBe("/product-placeholder.svg");
    expect(getSafeProductImageUrl("https://images.example.test/product.jpg")).toBe("https://images.example.test/product.jpg");
    expect(getSafeProductImageUrl("http://images.example.test/product.jpg")).toBe("/product-placeholder.svg");
  });
});

describe("ShopView product list", () => {
  test("renders the products provided by the catalog", () => {
    render(<ShopHarness />);

    expect(screen.getByRole("heading", { name: "Canvas Backpack" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cotton T-Shirt" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Travel Bag" })).toBeInTheDocument();
    expect(screen.getByText("Showing 3 of 3 products")).toBeInTheDocument();
  });

  test("filters products by title and category", () => {
    render(<ShopHarness />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search products" }), {
      target: { value: "travel" }
    });
    expect(screen.getByRole("heading", { name: "Travel Bag" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Canvas Backpack" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by category" }), {
      target: { value: "clothing" }
    });
    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Travel Bag" })).not.toBeInTheDocument();
  });

  test("filters matching products by selected category", () => {
    render(<ShopHarness />);

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by category" }), {
      target: { value: "bags" }
    });

    expect(screen.getByRole("heading", { name: "Canvas Backpack" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Travel Bag" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cotton T-Shirt" })).not.toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 products")).toBeInTheDocument();
  });
});

describe("CartView", () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: [{ ...cartItem }],
      discountCode: "",
      discountPercent: 0,
      discountMessage: ""
    });
    silenceCartLogging();
  });

  afterEach(() => jest.restoreAllMocks());

  test("updates quantity and recalculates subtotal, delivery, and total", () => {
    render(<CartView onCheckout={jest.fn()} onShop={jest.fn()} isLoggedIn />);

    expect(screen.getByRole("heading", { name: "Shopping Cart (2 items)" })).toBeInTheDocument();
    expect(screen.getAllByText("$40.00")).toHaveLength(2);
    expect(screen.getByText("$44.99")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(screen.getByRole("heading", { name: "Shopping Cart (3 items)" })).toBeInTheDocument();
    expect(useCartStore.getState().cart[0].quantity).toBe(3);
    expect(within(screen.getByText("Subtotal (3 items)").parentElement).getByText("$60.00")).toBeInTheDocument();
    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(screen.getByText("$60.00", { selector: ".total strong" })).toBeInTheDocument();
  });

  test("decreases quantity and removes an item when quantity reaches zero", () => {
    render(<CartView onCheckout={jest.fn()} onShop={jest.fn()} isLoggedIn />);

    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(useCartStore.getState().cart[0].quantity).toBe(1);
    expect(screen.getByRole("heading", { name: "Shopping Cart (1 items)" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(useCartStore.getState().cart).toEqual([]);
    expect(screen.getByText("Your cart is currently empty")).toBeInTheDocument();
  });

  test("removes an item from the cart", () => {
    render(<CartView onCheckout={jest.fn()} onShop={jest.fn()} isLoggedIn />);

    fireEvent.click(screen.getByRole("button", { name: "Remove item" }));
    expect(useCartStore.getState().cart).toEqual([]);
    expect(screen.getByText("Your cart is currently empty")).toBeInTheDocument();
  });
});

describe("CheckoutView", () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: [{ ...cartItem }],
      discountCode: "",
      discountPercent: 0
    });
    getToken.mockReset();
    api.get.mockReset();
    silenceCartLogging();
  });

  afterEach(() => jest.restoreAllMocks());

  test("shows cart items and calculated checkout total", () => {
    render(
      <CheckoutView
        onBack={jest.fn()}
        onFinish={jest.fn()}
        onNotify={jest.fn()}
        onRequireLogin={jest.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Order Items (2)" })).toBeInTheDocument();
    expect(screen.getByText("Canvas Backpack × 2")).toBeInTheDocument();
    expect(screen.getAllByText("$40.00")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Place Order · $44.99" })).toBeEnabled();
  });

  test("requires authentication before submitting an order", async () => {
    const onRequireLogin = jest.fn();
    const onFinish = jest.fn();
    getToken.mockReturnValue(null);

    render(
      <CheckoutView
        onBack={jest.fn()}
        onFinish={onFinish}
        onNotify={jest.fn()}
        onRequireLogin={onRequireLogin}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Place Order · $44.99" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Authentication required");
    expect(onRequireLogin).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
  });

  test("submits the authenticated order with the calculated total", async () => {
    const onFinish = jest.fn();
    const onNotify = jest.fn();
    getToken.mockReturnValue("test-token");
    api.get.mockResolvedValue({ data: {} });

    render(
      <CheckoutView
        onBack={jest.fn()}
        onFinish={onFinish}
        onNotify={onNotify}
        onRequireLogin={jest.fn()}
      />
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Full Name" }), {
      target: { value: "  Sam Shopper  " }
    });
    fireEvent.click(screen.getByRole("button", { name: "Place Order · $44.99" }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));

    expect(api.get).toHaveBeenCalledWith("/users/1");
    expect(onFinish.mock.calls[0][0]).toMatchObject({
      items: [{ ...cartItem }],
      customer: expect.objectContaining({ name: "Sam Shopper" }),
      subtotal: 40,
      deliveryCharge: 4.99,
      total: 44.99
    });
    expect(onNotify).toHaveBeenCalledWith(expect.stringContaining("placed successfully"));
  });

  test("does not create an order when session verification fails", async () => {
    const onFinish = jest.fn();
    getToken.mockReturnValue("test-token");
    api.get.mockRejectedValue(new Error("network error"));

    render(
      <CheckoutView
        onBack={jest.fn()}
        onFinish={onFinish}
        onNotify={jest.fn()}
        onRequireLogin={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Place Order · $44.99" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to verify your session");
    expect(onFinish).not.toHaveBeenCalled();
  });
});
