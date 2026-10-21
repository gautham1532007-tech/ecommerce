import React, { useState } from "react";
import { loginApi, registerUserApi, saveToken } from "../api";

const DEMO_USER = "mor_2314";
const DEMO_PASS = "83r5^_";

export default function LoginView({ onLoginSuccess, onBack, onNotify }) {
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "1-570-286-7463",
    city: "New York"
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  // Sign in handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Experiment 4 a: Login component using API authentication
      const data = await loginApi(username.trim(), password);

      if (!data || !data.token) {
        throw new Error("No token returned by the authentication server.");
      }

      // Experiment 4 b: Store the authentication token after successful login
      saveToken(data.token, username.trim());
      onNotify?.(`Welcome back, ${username}! Token stored successfully.`);
      onLoginSuccess(data.token, username.trim());
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Invalid username or password. Check credentials or use demo account below.");
      } else if (err.code === "ECONNABORTED") {
        setError("Network timeout contacting auth server. Please try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create account handler (POST /users)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!registerData.username.trim() || !registerData.password || !registerData.email) {
      setError("Please fill out all required fields.");
      return;
    }

    if (registerData.password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please re-check.");
      return;
    }

    setLoading(true);

    const payload = {
      email: registerData.email.trim(),
      username: registerData.username.trim(),
      password: registerData.password,
      name: {
        firstname: registerData.firstname.trim() || "User",
        lastname: registerData.lastname.trim() || "Customer"
      },
      address: {
        city: registerData.city.trim() || "Springfield",
        street: "Main St",
        number: 42,
        zipcode: "90210"
      },
      phone: registerData.phone.trim() || "555-0199"
    };

    try {
      // Send POST /users request to FakeStoreAPI
      const responseData = await registerUserApi(payload);
      const newUserId = responseData?.id || Math.floor(100 + Math.random() * 900);

      onNotify?.(`Account "${payload.username}" created successfully (User ID: #${newUserId})!`);
      setSuccessMsg(`✓ Account created successfully (User ID: #${newUserId})! You can now sign in below.`);

      // Pre-fill login credentials
      setUsername(payload.username);
      setPassword(payload.password);
      setAuthMode("login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to create account on REST API. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
    setError("");
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-icon">{authMode === "login" ? "🔐" : "👤"}</div>
        <p className="eyebrow">
          EXPERIMENT 4 · {authMode === "login" ? "API AUTHENTICATION" : "CREATE ACCOUNT (POST /users)"}
        </p>
        <h1>{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>
        <p className="muted">
          {authMode === "login"
            ? "Sign in to access your protected cart and authenticated checkout."
            : "Register a new user account via the REST API to receive a secure token."}
        </p>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === "register" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("register");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {successMsg && <div className="message info" role="status">{successMsg}</div>}
        {error && <div className="message error" role="alert">{error}</div>}

        {/* --- SIGN IN FORM --- */}
        {authMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="e.g. mor_2314 or your created username"
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-row">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button className="button button-wide" type="submit" disabled={loading}>
              {loading ? "Authenticating via API..." : "Sign in (POST /auth/login)"}
            </button>

            <div className="demo-box">
              <strong>Demo API Credentials:</strong>
              <div>Username: <code>{DEMO_USER}</code></div>
              <div>Password: <code>{DEMO_PASS}</code></div>
              <button className="text-button" type="button" onClick={handleFillDemo}>
                ⚡ Auto-fill Demo Credentials
              </button>
            </div>
          </form>
        ) : (
          /* --- CREATE ACCOUNT FORM --- */
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-firstname">First Name</label>
                <input
                  id="reg-firstname"
                  name="firstname"
                  value={registerData.firstname}
                  onChange={handleRegisterChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-lastname">Last Name</label>
                <input
                  id="reg-lastname"
                  name="lastname"
                  value={registerData.lastname}
                  onChange={handleRegisterChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              placeholder="john.doe@example.com"
              required
            />

            <label htmlFor="reg-username">Choose Username *</label>
            <input
              id="reg-username"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              placeholder="e.g. johndoe99"
              required
            />

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-password">Password *</label>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Min. 4 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-city">City (Optional)</label>
              <input
                id="reg-city"
                name="city"
                value={registerData.city}
                onChange={handleRegisterChange}
                placeholder="Springfield"
              />
            </div>

            <button className="button button-wide" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-inline" /> Registering via API...
                </>
              ) : (
                "Create Account (POST /users)"
              )}
            </button>
          </form>
        )}

        <button className="back-link" onClick={onBack}>
          ← Back to Shopping
        </button>
      </section>
    </main>
  );
}
