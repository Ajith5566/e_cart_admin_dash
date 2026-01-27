
import React, { useState } from "react";
import { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import type { AdminResponse, LoginFormData } from "../types/types";
import { adminloginAPi } from "../services/allAPi";
import './home_page.css'
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
 const navigate = useNavigate();
  const [admindata, setAdminData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  console.log(admindata);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = (await adminloginAPi(admindata)) as AxiosResponse<AdminResponse>;
      console.log(result);
      
      if (result.status === 200) {
        // Store user data & token
        sessionStorage.setItem(
          "existingAdmin",
          JSON.stringify(result.data.admin)
        );
        sessionStorage.setItem("token", result.data.token);

        toast.success("Login successful 🎉");
        
        // Reset form
        setAdminData({ email: "", password: "" });
        // Navigate to dashboard
         navigate('/admin-dash')
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Invalid email or password"
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-7">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              {/* Header */}
              <div className="card-header bg-primary bg-gradient text-white p-4 border-0">
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 mb-3 mx-auto d-inline-block">
                    <i className="bi bi-shield-check fs-2 text-white"></i>
                  </div>
                  <h1 className="h3 mb-1 fw-bold">Admin Panel</h1>
                  <p className="mb-0 opacity-90 fs-6">
                    Sign in to continue to Dashboard
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <div className="card-body p-5">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark mb-2">
                      <i className="bi bi-envelope me-2 text-muted"></i>
                      Email Address
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg border-start-0 shadow-sm focus-ring"
                        id="email"
                        value={admindata.email}
                        onChange={(e) =>
                          setAdminData({
                            ...admindata,
                            email: e.target.value,
                          })
                        }
                        placeholder="admin@company.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark mb-2">
                      <i className="bi bi-lock me-2 text-muted"></i>
                      Password
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control form-control-lg border-start-0 shadow-sm focus-ring"
                        id="password"
                        value={admindata.password}
                        onChange={(e) =>
                          setAdminData({
                            ...admindata,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold py-3 shadow-sm lift-effect"
                    disabled={isLoading || !admindata.email || !admindata.password}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                <hr className="my-4" />

                {/* Additional Links */}
                <div className="text-center">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Protected by enterprise security
                  </small>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-4">
              <div className="d-flex justify-content-center align-items-center gap-3">
                 <Link to={'/'} className="btn btn-link btn-sm text-decoration-none text-muted hover-text-primary">
                  ← Back to Home
                </Link> 
                <span className="text-muted">|</span>
                <a href="#" className="btn btn-link btn-sm text-decoration-none text-muted hover-text-primary">
                  Need Help?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage