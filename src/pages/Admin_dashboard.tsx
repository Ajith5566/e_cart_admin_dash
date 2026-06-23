/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { adminLogoutApi, checkAdminAuthApi } from "../services/allAPi";
import { toast } from "react-toastify";
import "./admin_dash.css";

import { Outlet, useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faBlog,
  faBox,
  faChevronDown,
  faFileLines,
  faGear,
  faPenToSquare,
  faQuoteLeft,
  faRightFromBracket,
  faTableCellsLarge,
  faTags,
  faUser,
  faUserGroup,
  faUsers,
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";

/* ─── Types ──────────────────────────────────────────── */
interface NavItem {
  key: string;
  label: string;
  icon: typeof faTableCellsLarge;
  path?: string;
  section?: string;
  children?: NavItem[];
}

/* ─── Nav config ─────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: faTableCellsLarge, path: "/admin-dash" },

  { key: "user", label: "Users", icon: faUsers, path: "/admin-dash/user", section: "Content" },

  {
    key: "blog-manager", label: "Blog Manager", icon: faBlog, section: "Content", children: [
      {
        key: "blog",
        label: "Blogs",
        icon: faBlog,
        path: "/admin-dash/blog"
      },
      {
        key: "blog-author",
        label: "Authors",
        icon: faUser,
        path: "/admin-dash/blogAuthor"
      }
    ]
  },

  { key: "banner", label: "Banner", icon: faPenToSquare, path: "/admin-dash/banner" },

  { key: "pages", label: "Pages", icon: faFileLines, path: "/admin-dash/pages" },

  { key: "products", label: "Products", icon: faBox, path: "/admin-dash/products", section: "Store" },

  { key: "category", label: "Category", icon: faTags, path: "/admin-dash/category" },

  { key: "testimonials", label: "Testimonials", icon: faQuoteLeft, path: "/admin-dash/testimonials", section: "Engagement" },

  { key: "settings", label: "Settings", icon: faGear, path: "/admin-dash/settings", section: "System" },
  { key: "profile", label: "Profile", icon: faGear, path: "/admin-dash/profile", section: "System" },
   { key: "login history", label: "login history", icon: faGear, path: "/admin-dash/login-history", section: "System" },
];

/* ─── Stat card data ─────────────────────────────────── */
const STATS = [
  { label: "Total Users", value: "2,840", trend: "+12%", up: true, color: "blue", icon: faUsers },
  { label: "Products", value: "184", trend: "+5%", up: true, color: "green", icon: faBox },
  { label: "Blog Posts", value: "36", trend: "-2%", up: false, color: "orange", icon: faBlog },
  { label: "Customers", value: "1,290", trend: "+18%", up: true, color: "red", icon: faUserGroup },
];

/* ═══════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════ */
function Admin_dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

 /*  console.log(currentUser); */
  

  const [isLogin, setIsLogin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = location.pathname.split("/")[2] || "dashboard";
  const isDashboard = location.pathname === "/admin-dash";

  const initials = currentUser?.name
  ?.replace(/[^\w\s]/g, "")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((word: string) => word[0])
  .join("")
  .toUpperCase() || "A";

  /* ── Auth check ── */
  useEffect(() => {
    (async () => {
      try {
        await checkAdminAuthApi();
        setIsLogin(true);
      } catch {
        setIsLogin(false);
        navigate("/");
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleMenu = (key: string) => {
    setOpenMenus(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };
  

  const filteredNavItems =
    currentUser.role === "super_admin"
      ? NAV_ITEMS
      : NAV_ITEMS.filter(
        item =>
          item.key !== "user" &&
          item.key !== "settings"&&
          item.key !== "login history"
      );

  /* ── Close sidebar on route change (mobile) ── */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  /* ── Logout ── */
  const logout = async () => {
    try {
      await adminLogoutApi();
      toast.success("Logged out successfully");
      localStorage.removeItem("adminUser");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  /* ── Navigate helper ── */
  const goTo = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  /* ─────────────────────────────────────────────────── */
  return (
    <div className="dashboard-wrapper">

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="admin-navbar">

        {/* Hamburger (mobile) */}
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(v => !v)}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Brand */}
        <div className="brand">
          <span className="brand-dot" />
          Admin Panel
        </div>

        {/* Right zone */}
        <div className="navbar-right">

          {/* Notification bell */}
          <button className="notif-btn" aria-label="Notifications">
            <FontAwesomeIcon icon={faBell} size="sm" />
            <span className="notif-badge" />
          </button>

          {/* Admin dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className="admin-pill"
              onClick={() => setDropdownOpen(v => !v)}
            >
              <div className="avatar">{initials}</div>
              <span className="name">{currentUser.name}</span>
              <FontAwesomeIcon icon={faChevronDown} className="chevron" />
            </button>

            <div className={`admin-dropdown ${dropdownOpen ? "open" : ""}`}>
              <button className="dropdown-item-btn" onClick={() => {
                navigate("/admin-dash/profile");
                setDropdownOpen(false);
              }}>
                <FontAwesomeIcon icon={faUser} /> Profile
              </button>
              <button className="dropdown-item-btn" onClick={() => navigate("/admin-dash/settings")} style={{ "border": "none", 'background': 'transparent' }}>
                <FontAwesomeIcon icon={faGear} /> Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item-btn danger" onClick={logout}>
                <FontAwesomeIcon icon={faRightFromBracket} /> Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ AUTH STATES ══════════ */}
      {!authChecked ? (
        <div className="auth-loading">
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Verifying access…</p>
        </div>

      ) : !isLogin ? (
        <div className="unauth-box">
          <div className="unauth-icon">🔒</div>
          <h2 className="unauth-title">Access Restricted</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 280 }}>
            You must be logged in to access the Admin panel.
          </p>
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate("/")}>
            Go to Login
          </button>
        </div>

      ) : (
        /* ══════════ AUTHENTICATED LAYOUT ══════════ */
        <div className="dashboard-body">

          {/* ── Overlay (mobile) ── */}
          <div
            className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* ══════════ SIDEBAR ══════════ */}
          <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
            <nav className="sidebar-nav">
              {filteredNavItems.map((item, idx) => {
                const isActive =
                  item.key === "dashboard"
                    ? activeTab === "dashboard"
                    : activeTab === item.key;

                /* Section label before first item of each section */
                const showSection =
                  item.section &&
                  (idx === 0 || NAV_ITEMS[idx - 1].section !== item.section);

                return (
                  <div key={item.key}>
                    {showSection && (
                      <div className="sidebar-section-label">
                        {item.section}
                      </div>
                    )}

                    {item.children ? (
                      <>
                        {/* Blog Manager */}
                        <button
                          className="nav-btn"
                          onClick={() => toggleMenu(item.key)}
                        >
                          <span className="nav-icon">
                            <FontAwesomeIcon icon={item.icon} />
                          </span>

                          {item.label}

                          <FontAwesomeIcon
                            icon={faChevronDown}
                            style={{
                              marginLeft: "auto",
                              transform: openMenus.includes(item.key)
                                ? "rotate(180deg)"
                                : "rotate(0deg)"
                            }}
                          />
                        </button>

                        {openMenus.includes(item.key) && (
                          <div className="submenu">
                            {item.children.map(child => (
                              <button
                                key={child.key}
                                className={`submenu-btn ${location.pathname === child.path ? "active" : ""
                                  }`}
                                onClick={() => goTo(child.path!)}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        className={`nav-btn ${isActive ? "active" : ""}`}
                        onClick={() => goTo(item.path!)}
                      >
                        <span className="nav-icon">
                          <FontAwesomeIcon icon={item.icon} />
                        </span>

                        {item.label}
                      </button>
                    )}
                  </div>
                );

              })}
            </nav>

            {/* Sidebar footer — logout shortcut */}
            <div className="sidebar-footer">
              <button className="nav-btn" onClick={logout} style={{ color: "rgba(239,68,68,0.6)" }}>
                <span className="nav-icon">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </span>
                Log out
              </button>
            </div>
          </aside>

          {/* ══════════ MAIN CONTENT ══════════ */}
          <main className="admin-main">

            {/* ── Dashboard overview ── */}
            {isDashboard && (
              <>
                {/* Page header */}
                <div className="page-header fade-up">
                  <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">{currentUser?.name || "Admin"}👋</p>
                  </div>
                  <button className="btn-primary">
                    + New Report
                  </button>
                </div>

                {/* Stat cards */}
                <div className="stats-grid">
                  {STATS.map((s, i) => (
                    <div
                      key={s.label}
                      className={`stat-card ${s.color} fade-up fade-up-${i + 1}`}
                    >
                      <div className={`stat-icon ${s.color}`}>
                        <FontAwesomeIcon icon={s.icon} />
                      </div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                      <div className={`stat-trend ${s.up ? "up" : "down"}`}>
                        <FontAwesomeIcon icon={s.up ? faArrowTrendUp : faArrowTrendDown} size="xs" />
                        {s.trend} this month
                      </div>
                    </div>
                  ))}
                </div>

                {/* Placeholder recent activity card */}
                <div className="content-card fade-up fade-up-4">
                  <div className="content-card-body">
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                      Recent Activity
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
                      Activity feed will appear here once connected to your data source.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── Sub-pages ── */}
            {!isDashboard && (
              <div className="content-card fade-up">
                <div className="content-card-body">
                  <Outlet />
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default Admin_dashboard;