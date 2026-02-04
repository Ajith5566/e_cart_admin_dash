/* eslint-disable react-hooks/set-state-in-effect */
import  { useCallback, useEffect, useState } from 'react'
import type { fetchedProducts, User } from '../types/types';
import { adminLogoutApi, blockUserApi, checkAdminAuthApi, getAllProductsApi, getAllusersApi } from '../services/allAPi';
import { toast } from 'react-toastify';
/* import type { AxiosResponse } from 'axios'; */
import './admin_dash.css'
/* import PageEditor from '../components/PageEditor'; */
import Products from '../components/Products';
import { useNavigate } from 'react-router-dom';
import { Outlet } from "react-router";

/* type BlockUserResponse = {
  message: string;
  isBlocked: boolean;
}; */
function Admin_dashboard() {
     const navigate = useNavigate();
  /* ================= STATE ================= */
  const [users, setUsers] = useState<User[]>([]);
  /* const [token, setToken] = useState<string>(""); */
  const [products, setProducts] = useState<fetchedProducts[]>([]);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "pages"
  >("dashboard");

  const user_count = users.length;
  const product_count=products.length;

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


const fetchUsers = useCallback(async () => {
  try {
    const result = await getAllusersApi(page, 5);
    setUsers(result.data.docs);
    setTotalPages(result.data.totalPages);
  } catch {
    toast.error("Session expired");
    navigate("/");
  }
}, [page, navigate]);

useEffect(() => {
  if (isLogin) {
    fetchUsers();
  }
}, [isLogin, page, fetchUsers]);

  //get all products
const fetchProducts = useCallback(async () => {
  try {
    const result = await getAllProductsApi();
    setProducts(result.data);
  } catch (err) {
    console.error("FRONTEND ERROR:", err);
  }
}, []);

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

useEffect(() => {
  if (isLogin) {
    fetchProducts();
  }
}, [fetchProducts, isLogin]);









  /* ================= ACTIONS ================= */
 const handleBlock = async (id: string) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    await blockUserApi(id);
    toast.success("User updated");
    fetchUsers();
  } catch {
    toast.error("Unauthorized");
    navigate("/");
  }
};


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
          {!isLogin ? (
            <div className="unauth-box w-100 d-flex justify-content-center align-items-center min-vh-100 flex-column">
              <h3>Unauthorized ❌</h3>
              <p>You need to login to Access the <b>Admin</b> panel</p>
              <button
                className="btn btn-success"
                 onClick={() => navigate("/")} 
              >
                Go to Login
              </button>
            </div>):(<div className="container-fluid ">
        <div className="row min-vh-100">
          {/* ================= SIDEBAR ================= */}
          <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm border-end">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                      activeTab === "dashboard"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover-bg-light"
                    }`}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link text-start border-0 w-100 px-3 py-2 mb-2 rounded-3 ${
                      activeTab === "products"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover-bg-light"
                    }`}
                    onClick={() => setActiveTab("products")}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Products
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link text-start border-0 w-100 px-3 py-2 rounded-3 ${
                      activeTab === "pages"
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
              </ul>
            </div>
          </nav>

          {/* ================= MAIN CONTENT ================= */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            {/* ===== DASHBOARD ===== */}
            {activeTab === "dashboard" && (
              <>
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                  <h1 className="h2 fw-bold text-dark">Dashboard hai Overview</h1>
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
                            <h4 className="mb-0 fw-bold text-primary">{user_count}</h4>
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
                            <h4 className="mb-0 fw-bold text-success">{product_count}</h4>
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

                {/* USERS TABLE */}
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-0 pb-0">
                    <h5 className="mb-3 fw-semibold text-dark">Users Management</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 py-3">
                              <div className="d-flex align-items-center">
                                <span className="fw-semibold text-dark fs-6">Name</span>
                              </div>
                            </th>
                            <th className="border-0 py-3">
                              <span className="fw-semibold text-dark fs-6">Email</span>
                            </th>
                            <th className="border-0 py-3 text-center">
                              <span className="fw-semibold text-dark fs-6">Status</span>
                            </th>
                            <th className="border-0 py-3 text-center">
                              <span className="fw-semibold text-dark fs-6">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length > 0 ? (
                            users.map((item) => (
                              <tr key={item._id} className="hover-row">
                                <td className="py-4">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center me-3">
                                      <i className="bi bi-person fs-6 text-muted"></i>
                                    </div>
                                    <div>
                                      <div className="fw-semibold text-dark">{item.username}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="fw-medium text-dark">{item.mailId}</div>
                                </td>
                                <td className="py-4 text-center">
                                  <span
                                    className={`badge fs-6 fw-semibold px-3 py-2 rounded-pill ${
                                      item.isBlocked
                                        ? "bg-danger-subtle text-danger border border-danger-subtle"
                                        : "bg-success-subtle text-success border border-success-subtle"
                                    }`}
                                  >
                                    {item.isBlocked ? "Blocked" : "Active"}
                                  </span>
                                </td>
                                <td className="py-4 text-center">
                                  <button
                                    type="button"
                                    className={`btn btn-sm fw-semibold px-4 ${
                                      item.isBlocked
                                        ? "btn-outline-success hover-shadow"
                                        : "btn-outline-danger hover-shadow"
                                    }`}
                                    onClick={() => handleBlock(item._id)}
                                  >
                                    {item.isBlocked ? "Unblock" : "Block"}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-5 text-muted">
                                <i className="bi bi-people display-4 opacity-25 mb-3 d-block"></i>
                                <div className="fs-4">No users found</div>
                                <small>Users will appear here once registered.</small>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀ Prev
        </button>

        <span>
          Page <strong>{page}</strong> of{" "}
          <strong>{totalPages}</strong>
        </span>

        <button
          className="btn btn-outline-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===== PRODUCTS ===== */}
            {activeTab === "products" && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 pb-0">
                  <h1 className="h2 mb-3 fw-bold text-dark">Products Management</h1>
                </div>
                <div className="card-body p-0">
                  { <Products /> } 
                </div>
              </div>
            )}

            {/* ===== ORDERS ===== */}
            {activeTab === "pages" && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-0 pb-0">
                    <h1 className="h2 mb-3 fw-bold text-dark">Pages Management</h1>
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