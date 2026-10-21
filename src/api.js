import axios from "axios";

export const TOKEN_KEY = "jexocart_auth_token";
export const USERNAME_KEY = "jexocart_username";

export const api = axios.create({
  baseURL: "https://fakestoreapi.com",
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// Experiment 4 d: Configure Axios request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Experiment 4 g: Configure Axios response interceptor to handle invalid or expired tokens (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USERNAME_KEY);
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    return Promise.reject(error);
  }
);

// Token helpers
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token, username) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (username) localStorage.setItem(USERNAME_KEY, username);
};
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};
export const getStoredUsername = () => localStorage.getItem(USERNAME_KEY) || "";

// Experiment 4 a: Login API request
export const loginApi = async (username, password) => {
  // Check if credentials match a newly registered user from POST /users
  try {
    const createdUsers = JSON.parse(localStorage.getItem("jexocart_created_accounts") || "[]");
    const matched = createdUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (matched) {
      // Generate standard JWT token for the created account
      const token = "jwt_" + Math.random().toString(36).substring(2) + "." + btoa(username) + "." + Date.now();
      return { token, user: matched };
    }
  } catch (err) {
    // fallback to remote API
  }

  // Remote authentication via FakeStoreAPI
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

// Experiment 4: Register / Create Account API request (POST /users)
export const registerUserApi = async (userData) => {
  const response = await api.post("/users", userData);
  
  // Persist locally so the user can immediately log in with their new credentials
  try {
    const existing = JSON.parse(localStorage.getItem("jexocart_created_accounts") || "[]");
    const updated = [
      ...existing.filter((u) => u.username !== userData.username),
      { ...userData, id: response.data?.id || Date.now() }
    ];
    localStorage.setItem("jexocart_created_accounts", JSON.stringify(updated));
  } catch (e) {}

  return response.data;
};

// Helper for rich, styled console outputs of CRUD operations (Experiment 3 viva verification)
const logCrudOperation = (method, endpoint, payload, responseData, status = 200) => {
  const colors = {
    GET: "#0284c7",
    POST: "#16a34a",
    PUT: "#d97706",
    DELETE: "#dc2626"
  };
  const badgeColor = colors[method] || "#6366f1";

  console.groupCollapsed(
    `%c[CRUD REST API]%c ${method} %c${endpoint} %c(${status})`,
    "color: #a855f7; font-weight: 800; font-size: 11px;",
    `background: ${badgeColor}; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 11px;`,
    "color: #38bdf8; font-weight: 700; font-family: monospace;",
    "color: #10b981; font-weight: 700;"
  );
  console.log("%cAction:%c HTTP " + method + " Request", "color: #94a3b8; font-weight: bold;", "color: #334155;");
  console.log("%cEndpoint:%c https://fakestoreapi.com" + endpoint, "color: #94a3b8; font-weight: bold;", "color: #0284c7;");
  console.log("%cTimestamp:%c " + new Date().toLocaleTimeString(), "color: #94a3b8; font-weight: bold;", "color: #334155;");
  if (payload) {
    console.log("%cRequest Payload:%c", "color: #d97706; font-weight: bold;", "", payload);
  }
  console.log("%cAPI Response Output:%c", "color: #10b981; font-weight: bold;", "", responseData);
  console.groupEnd();
};

// Experiment 1 a & d & Experiment 3 a: Retrieve products using GET
export const fetchProductsApi = async (limit, { signal } = {}) => {
  if (limit !== undefined && (!Number.isSafeInteger(Number(limit)) || Number(limit) < 1)) {
    throw new TypeError("Product limit must be a positive integer.");
  }
  const url = limit ? `/products?limit=${encodeURIComponent(Number(limit))}` : "/products";
  const response = await api.get(url, { signal });
  if (!Array.isArray(response.data) || response.data.some((product) =>
    !product ||
    typeof product !== "object" ||
    !Number.isSafeInteger(Number(product.id)) ||
    Number(product.id) < 1 ||
    typeof product.title !== "string" ||
    product.title.length > 200 ||
    typeof product.category !== "string" ||
    product.category.length > 100 ||
    !Number.isFinite(Number(product.price)) ||
    Number(product.price) < 0
  )) {
    throw new TypeError("The product API returned an invalid product list.");
  }
  logCrudOperation("GET", url, null, response.data, response.status);
  return response.data;
};

export const fetchProductByIdApi = async (id, { signal } = {}) => {
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new TypeError("A valid product ID is required.");
  }
  const endpoint = `/products/${encodeURIComponent(productId)}`;
  const response = await api.get(endpoint, { signal });
  if (
    !response.data ||
    typeof response.data !== "object" ||
    Array.isArray(response.data) ||
    !Number.isSafeInteger(Number(response.data.id)) ||
    Number(response.data.id) < 1 ||
    typeof response.data.title !== "string" ||
    response.data.title.length > 200 ||
    !Number.isFinite(Number(response.data.price))
  ) {
    throw new TypeError("The product API returned invalid product details.");
  }
  logCrudOperation("GET", endpoint, null, response.data, response.status);
  return response.data;
};

export const fetchCategoriesApi = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

// Experiment 3: Product CRUD operations using APIs
// b) Add products using POST
export const addProductApi = async (productData) => {
  validateProductPayload(productData);
  const endpoint = "/products";
  const response = await api.post(endpoint, productData);
  logCrudOperation("POST", endpoint, productData, response.data, response.status);
  return response.data;
};

// c) Update product details using PUT
export const updateProductApi = async (id, productData) => {
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new TypeError("A valid product ID is required.");
  }
  validateProductPayload(productData);
  const endpoint = `/products/${encodeURIComponent(productId)}`;
  const response = await api.put(endpoint, productData);
  logCrudOperation("PUT", endpoint, productData, response.data, response.status);
  return response.data;
};

// d) Delete products using DELETE
export const deleteProductApi = async (id) => {
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new TypeError("A valid product ID is required.");
  }
  const endpoint = `/products/${encodeURIComponent(productId)}`;
  const response = await api.delete(endpoint);
  logCrudOperation("DELETE", endpoint, { id: productId }, response.data, response.status);
  return response.data;
};

function validateProductPayload(product) {
  if (
    !product ||
    typeof product.title !== "string" ||
    !product.title.trim() ||
    product.title.length > 200 ||
    typeof product.category !== "string" ||
    !product.category.trim() ||
    product.category.length > 100 ||
    !Number.isFinite(Number(product.price)) ||
    Number(product.price) < 0 ||
    typeof product.description !== "string" ||
    product.description.length > 2000
  ) {
    throw new TypeError("Product data is incomplete or contains invalid values.");
  }
  if (product.image) {
    let imageUrl;
    try {
      imageUrl = new URL(product.image);
    } catch {
      throw new TypeError("Product image must be a valid HTTPS URL.");
    }
    if (imageUrl.protocol !== "https:" || imageUrl.username || imageUrl.password) {
      throw new TypeError("Product image must use a secure HTTPS URL.");
    }
  }
}