/* eslint-disable react-hooks/set-state-in-effect */
import {  useEffect, useState } from 'react'
/* import type { fetchedProducts,  User } from '../types/types'; */
import { adminLogoutApi, checkAdminAuthApi,/*  getAllProductsApi */ } from '../services/allAPi';
import { toast } from 'react-toastify';
/* import type { AxiosResponse } from 'axios'; */
import './admin_dash.css'
/* import PageEditor from '../components/PageEditor'; */
/* import Products from '../components/Products'; */
import { Outlet, useNavigate } from "react-router";



/* type BlockUserResponse = {
  message: string;
  isBlocked: boolean;
}; */
function Admin_dashboard() {
   const navigate = useNavigate();
  /* const [token, setToken] = useState<string>(""); */
  /* const [products, setProducts] = useState<fetchedProducts[]>([]); */
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);

 
  const [activeTab, setActiveTab] = useState<
    "dashboard" |"User"| "products" | "pages"|"Customer_list"
  >("dashboard");

/*   const user_count = users.length;
  const product_count = products.length; */

  /* ================= EFFECTS ================= */
  useEffect(() => {

    const verifyAuth = async () => {
      try {
        await checkAdminAuthApi();
        setIsLogin(true);
      } catch {
        setIsLogin(false);
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAuth();

  }, []);

/* 
  //get all products
  const fetchProducts = useCallback(async () => {
    try {
      const result = await getAllProductsApi();
      setProducts(result.data.docs);
    } catch (err) {
      console.error("FRONTEND ERROR:", err);
    }
  }, []); */

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAdminAuthApi(); // calls /admin/me
        setIsLogin(true);
      } catch {
        setIsLogin(false);
        navigate("/"); // login page
      }
    };

    verifyAuth();
  }, [navigate]);












  const logout = async () => {
    try {
      await adminLogoutApi();
      toast.success("Logged out");

      navigate("/"); // login page
    } catch {
      toast.error("Logout failed");
    }
  };
  return (
    <>
      <div className="min-vh-100 bg-light">
        {/* ================= HEADER ================= */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm p-2">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold fs-4" href="#">
              <i className="bi bi-shield-check me-2"></i>
              Admin Panel
            </a>
          </div>
          {/* Logout button shown only if user is logged in */}
          {isLogin && (
            <div className="logout-row">
              <button className="btn btn-danger" onClick={logout} >
                Logout
              </button>
            </div>
          )}
        </nav>
        {/* If NOT logged in */}
        {!authChecked ? (
          <h3>Loading...</h3>   // or spinner
        ) :
        !isLogin ? (
          <div className="unauth-box w-100 d-flex justify-content-center align-items-center min-vh-100 flex-column">
            <h3>Unauthorized ❌</h3>
            <p>You need to login to Access the <b>Admin</b> panel</p>
            <button
              className="btn btn-success"
              onClick={() => navigate("/")}
            >
              Go to Login
            </button>
          </div>) : (<div className="container-fluid ">
            <div className="row min-vh-100">
              {/* ================= SIDEBAR ================= */}
              <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm border-end">
                <div className="position-sticky pt-3">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${activeTab === "dashboard"
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                          }`}
                        onClick={() => setActiveTab("dashboard")}
                      >
                        <i className="bi bi-house-door me-2"></i>
                        Dashboard
                      </button>
                    </li>

                    {/* products */}
                    <li className="nav-item">

                      <button
                        type="button"
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${activeTab === "products"
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                          }`}
                        onClick={() => {
                          setActiveTab("products");
                          navigate("/admin-dash/products");
                        }}
                      >
                        <i className="bi bi-box-seam me-2"></i>
                        Products
                      </button>
                    </li>
                    {/* users */}

                     <li className="nav-item">

                      <button
                        type="button"
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${activeTab === "User"
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                          }`}
                        onClick={() => {
                          setActiveTab("User");
                          navigate("/admin-dash/user");
                        }}
                      >
                        <i className="bi bi-box-seam me-2"></i>
                        Users
                      </button>
                    </li>


                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link text-start border-0 w-100 px-3 py-2 rounded-3 ${activeTab === "pages"
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                          }`}
                        onClick={() => {
                          setActiveTab("pages");
                          navigate("/admin-dash/pages");
                        }}
                      >
                        <i className="bi bi-cart-check me-2"></i>
                        Pages
                      </button>
                    </li>

                    {/* customer list */}
                    <li className="nav-item">

                      <button
                        type="button"
                        className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${activeTab === "Customer_list"
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                          }`}
                        onClick={() => {
                          setActiveTab("Customer_list");
                          navigate("/admin-dash/Customer_list");
                        }}
                      >
                        <i className="bi bi-box-seam me-2"></i>
                        Customer_list
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>

              {/* ================= MAIN CONTENT ================= */}
              <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
                {/* ===== DASHBOARD ===== */}
                {activeTab === "dashboard" && (
                  <>
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                      <h1 className="h2 fw-bold text-dark">Dashboard Overview</h1>
                    </div>

                    {/* STATISTICS CARDS */}
                    <div className="row mb-5">
                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary rounded-circle p-3 me-3">
                                <i className="bi bi-people-fill text-white fs-5"></i>
                              </div>
                              <div>
                                <h4 className="mb-0 fw-bold text-primary">10</h4>
                                <p className="mb-0 text-muted small">Total Users</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="bg-success rounded-circle p-3 me-3">
                                <i className="bi bi-boxes text-white fs-5"></i>
                              </div>
                              <div>
                                <h4 className="mb-0 fw-bold text-success">10</h4>
                                <p className="mb-0 text-muted small">Products</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="bg-info rounded-circle p-3 me-3">
                                <i className="bi bi-bag-check text-white fs-5"></i>
                              </div>
                              <div>
                                <h4 className="mb-0 fw-bold text-info">89</h4>
                                <p className="mb-0 text-muted small">Orders</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="bg-warning rounded-circle p-3 me-3">
                                <i className="bi bi-graph-up text-white fs-5"></i>
                              </div>
                              <div>
                                <h4 className="mb-0 fw-bold text-warning">$24,500</h4>
                                <p className="mb-0 text-muted small">Revenue</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    
                  </>
                )}
                {/* ===== PRODUCTS ===== */}
                {activeTab === "products" && (
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <Outlet />
                    </div>
                  </div>
                )}

                {/* ===== PRODUCTS ===== */}
                {activeTab === "User" && (
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <Outlet />
                    </div>
                  </div>
                )}


                {/* ===== Pages ===== */}
                {activeTab === "pages" && (
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <Outlet /> {/* 👈 Page list OR Add page loads here */}
                    </div>
                  </div>
                )}

                 {/* ===== customer list ===== */}
                {activeTab === "Customer_list" && (
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-0 pb-0">
                      <h1 className="h2 mb-3 fw-bold text-dark">Customers Management</h1>
                    </div>
                    <div className="card-body">
                      <Outlet /> {/* 👈 Page list OR Add page loads here */}
                    </div>
                  </div>
                )}

              </main>
            </div>
          </div>)}


      </div>
    </>
  )
}


export default Admin_dashboard