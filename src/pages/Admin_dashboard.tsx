/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { adminLogoutApi, checkAdminAuthApi } from "../services/allAPi";
import { toast } from "react-toastify";
import "./admin_dash.css";

import { Outlet, useNavigate, useLocation } from "react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faBlog,
  faBox,
  faFileLines,
  faGear,
  faTableCellsLarge,
  faTags,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AdminDropDown from "../components/AdminDropDown";

function Admin_dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ===== Detect active tab from URL ===== */
  const activeTab = location.pathname.split("/")[2] || "dashboard";

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAdminAuthApi();
        setIsLogin(true);
      } catch {
        setIsLogin(false);
        navigate("/");
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [navigate]);

  /* ================= LOGOUT ================= */

  const logout = async () => {
    try {
      await adminLogoutApi();
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <div className="dashboard-wrapper bg-light">
        {/* ================= HEADER ================= */}

        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-3 sticky-top">
          <div className="d-flex align-items-center">
            <span className="fw-bold fs-5">Admin Panel</span>
          </div>

          {/* ADMIN DROPDOWN */}

          <div
            className="ms-auto position-relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="btn d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: "35px", height: "35px" }}
              >
                SA
              </div>

              <span className="fw-semibold">
                Super Admin <FontAwesomeIcon icon={faAngleDown} />
              </span>
            </button>

            <AdminDropDown dropdownOpen={dropdownOpen} logout={logout} />
          </div>
        </nav>

        {/* ================= AUTH LOADING ================= */}

        {!authChecked ? (
          <h3 className="text-center mt-5">Loading...</h3>
        ) : !isLogin ? (
          <div className="unauth-box w-100 d-flex justify-content-center align-items-center min-vh-100 flex-column">
            <h3>Unauthorized ❌</h3>
            <p>
              You need to login to Access the <b>Admin</b> panel
            </p>
            <button className="btn btn-success" onClick={() => navigate("/")}>
              Go to Login
            </button>
          </div>
        ) : (
          <div className="container-fluid dashboard-content">
            <div className="row flex grow-1">

              {/* ================= SIDEBAR ================= */}

              <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm border-end">
                <div className="position-sticky pt-3">
                  <ul className="nav flex-column">

                    {/* Dashboard */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "dashboard"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash")}
                      >
                        <FontAwesomeIcon icon={faTableCellsLarge} /> Dashboard
                      </button>
                    </li>

                    {/* Users */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "user"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/user")}
                      >
                        <FontAwesomeIcon icon={faUsers} /> Users
                      </button>
                    </li>

                    {/* blogs */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "blog"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/blog")}
                      >
                        <FontAwesomeIcon icon={faBlog} /> blog
                      </button>
                    </li>


                    {/* Pages */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "pages"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/pages")}
                      >
                        <FontAwesomeIcon icon={faFileLines} /> Pages
                      </button>
                    </li>

                    {/* Products */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "products"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/products")}
                      >
                        <FontAwesomeIcon icon={faBox} /> Products
                      </button>
                    </li>
                    {/* product category */}
                     <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "category"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/category")}
                      >
                       <FontAwesomeIcon icon={faTags} /> category
                      </button>
                    </li>


                    {/* Customers */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "Customer_list"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() =>
                          navigate("/admin-dash/Customer_list")
                        }
                      >
                        <FontAwesomeIcon icon={faUserGroup} /> Customer List
                      </button>
                    </li>

                    {/* Settings */}

                    <li className="nav-item">
                      <button
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                          activeTab === "settings"
                            ? "bg-primary text-white"
                            : "text-muted"
                        }`}
                        onClick={() => navigate("/admin-dash/settings")}
                      >
                        <FontAwesomeIcon icon={faGear} /> Settings
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>

              {/* ================= MAIN CONTENT ================= */}

              <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4 main-scroll-area">

                {/* Dashboard page */}

                {location.pathname === "/admin-dash" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
                      <h1 className="h2 fw-bold">Dashboard Overview</h1>
                    </div>

                    <div className="row mb-5">

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h4 className="text-primary fw-bold">10</h4>
                            <p className="text-muted small">Total Users</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h4 className="text-success fw-bold">10</h4>
                            <p className="text-muted small">Products</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </>
                )}

                {/* Other pages */}

                {location.pathname !== "/admin-dash" && (
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <Outlet />
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Admin_dashboard;