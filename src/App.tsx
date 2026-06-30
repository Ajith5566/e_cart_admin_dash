import { Route, Routes } from "react-router-dom";
import "./App.css";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import HomePage from "./pages/HomePage";
import Admin_dashboard from "./pages/Admin_dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from "react-toastify";
import PageEditor from "./components/admin_pages/PageEditor";
import Add_page from "./components/admin_pages/add_page";
import Add_product from "./components/products/Add_product";
import Products from "./components/products/Products";
import User_page from "./components/users/User_page";
import Add_user from "./components/users/Add_user";
import Settings from "./components/settings/Settings";
import Product_category from "./components/category/Product_category"
import ForgotPassword from "./forgot_password/Forgotpassword";
import ResetPassword from "./forgot_password/Reset_password";
import Add_category from "./components/category/Add_category";
import Blog from "./components/blog/Blog";
import Add_blog from "./components/blog/Add_blog";
import Testimonials from "./components/testimonials/Testimonial";
import Add_testimonial from "./components/testimonials/Add_testimonials";
import Banner from "./components/banner/Banner";
import Add_banner from "./components/banner/Add_Banner";
import Profile from "./components/profile/profile";
import BlogAuthor from "./components/blog_author/Blog_author";
import Add_blog_author from "./components/blog_author/Add_blogAuthor";
import LoginHistory from "./components/login_history/Login_history";
import RolePermissions from "./pages/RolePermissions";
import { AuthProvider } from "./context/AuthContext";
import PermissionProtectedRoute from "./routes/PermissionProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin-dash" element={ <AuthProvider><Admin_dashboard /></AuthProvider>}>
          <Route path="pages" element={<PageEditor />} />
          <Route path="pages/add" element={<PermissionProtectedRoute module="pages" action="create"><Add_page /></PermissionProtectedRoute>} />
          <Route path="pages/edit/:id" element={<PermissionProtectedRoute module="pages" action="update"><Add_page /></PermissionProtectedRoute>} />

          <Route path="products" element={<Products />} />
          <Route path="product/add" element={<PermissionProtectedRoute module="products" action="create"><Add_product/></PermissionProtectedRoute>} />
          <Route path="product/edit/:id" element={<PermissionProtectedRoute module="products" action="update"><Add_product /></PermissionProtectedRoute>} />  {/* ✅ new */}

          <Route path="user" element={<RoleProtectedRoute allowedRoles={["super_admin"]}>  <User_page /> </RoleProtectedRoute>}  />
          <Route path="user/add" element={ <RoleProtectedRoute allowedRoles={["super_admin"]} > <Add_user /> </RoleProtectedRoute>}  />
          <Route path="user/edit/:id" element={ <RoleProtectedRoute allowedRoles={["super_admin"]} > <Add_user /> </RoleProtectedRoute>}  />

          <Route path="category" element={<Product_category/>} />
          <Route path="category/add" element={<PermissionProtectedRoute module="category" action="create"><Add_category/></PermissionProtectedRoute>} />
          <Route path="category/edit/:id" element={<PermissionProtectedRoute module="category" action="update"><Add_category/></PermissionProtectedRoute>} />

          <Route path="blog" element={<Blog/>}  />
          <Route path="blog/add" element={<PermissionProtectedRoute module="blog" action="create"><Add_blog/></PermissionProtectedRoute>} />
          <Route path="blog/edit/:id" element={<PermissionProtectedRoute module="blog" action="update"><Add_blog/></PermissionProtectedRoute>} />

          <Route path="blogAuthor" element={<BlogAuthor/>}  />
          <Route path="blogAuthor/add" element={<PermissionProtectedRoute module="author" action="create"><Add_blog_author/></PermissionProtectedRoute>} />
          <Route path="blogAuthor/edit/:id" element={<PermissionProtectedRoute module="author" action="update"><Add_blog_author/></PermissionProtectedRoute>} />
          

          <Route path="testimonials" element={<Testimonials/>} />
          <Route path="testimonials/add" element={<PermissionProtectedRoute module="testimonials" action="create"><Add_testimonial/></PermissionProtectedRoute>} />
           <Route path="testimonials/edit/:id" element={<PermissionProtectedRoute module="testimonials" action="update"><Add_testimonial/></PermissionProtectedRoute>} />


          <Route path="banner" element={<Banner/>} />
          <Route path="banner/add" element={<PermissionProtectedRoute module="banner" action="create"><Add_banner/></PermissionProtectedRoute>} />
          <Route path="banner/edit/:id" element={<PermissionProtectedRoute module="banner" action="update"><Add_banner/></PermissionProtectedRoute>} />

           <Route path="profile" element={<Profile />} />
           <Route path="login-history" element={<RoleProtectedRoute allowedRoles={["super_admin"]}>  <LoginHistory /> </RoleProtectedRoute>}  />


          <Route path="settings" element={<RoleProtectedRoute allowedRoles={["super_admin"]} > <Settings/> </RoleProtectedRoute>} />
          <Route path="/admin-dash/role-permissions" element={<RoleProtectedRoute allowedRoles={["super_admin"]}><RolePermissions /></RoleProtectedRoute>} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        theme="colored"
      />
    </>
  );
}

export default App;
