import React, { useState } from "react";
import { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import type { AdminResponse, LoginFormData } from "../types/types";
import { adminloginAPi } from "../services/allAPi";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowRight, faShieldHalved, faLock } from "@fortawesome/free-solid-svg-icons";
import "./home_page.css";

function HomePage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [admindata, setAdminData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = (await adminloginAPi({ ...admindata, rememberMe })) as AxiosResponse<AdminResponse>;

      if (result.status === 200) {
        localStorage.setItem("adminUser", JSON.stringify(result.data.admin));
        toast.success("Login successful");
        setAdminData({ email: "", password: "" });
        navigate("/admin-dash");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Invalid email or password");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lp-page">
      <div className="lp-card">

        {/* Header */}
        <div className="lp-header">
          <div className="lp-icon-wrap">
            <FontAwesomeIcon icon={faShieldHalved} className="lp-icon" />
          </div>
          <h1 className="lp-title">Admin panel</h1>
          <p className="lp-subtitle">Sign in to continue to your dashboard</p>
        </div>

        {/* Body */}
        <div className="lp-body">
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="lp-field-group">
              <label htmlFor="email" className="lp-label">Email address</label>
              <input
                type="email"
                id="email"
                className="lp-input"
                value={admindata.email}
                onChange={(e) => setAdminData({ ...admindata, email: e.target.value })}
                placeholder="admin@company.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field-group">
              <label htmlFor="password" className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="lp-input"
                  value={admindata.password}
                  onChange={(e) => setAdminData({ ...admindata, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="lp-options-row">
              <label className="lp-check-label">
                <input
                  type="checkbox"
                  className="lp-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="lp-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="lp-submit-btn"
              disabled={isLoading || !admindata.email || !admindata.password}
            >
              {isLoading ? (
                <>
                  <span className="lp-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} />
                  Sign in
                </>
              )}
            </button>

          </form>

          <div className="lp-divider" />

          <div className="lp-security-note">
            <FontAwesomeIcon icon={faLock} />
            Protected by enterprise security
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;