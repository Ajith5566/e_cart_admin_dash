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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin-dash" element={<Admin_dashboard />}>
          <Route path="pages" element={<PageEditor />} />
          <Route path="pages/add" element={<Add_page />} />
          <Route path="pages/edit/:id" element={<Add_page />} />

          <Route path="products" element={<Products />} />
          <Route path="product/add" element={<Add_product/>} />
          <Route path="product/edit/:id" element={<Add_product />} />  {/* ✅ new */}

          <Route path="user" element={<RoleProtectedRoute allowedRoles={["super_admin"]}>  <User_page /> </RoleProtectedRoute>}  />
          <Route path="user/add" element={ <RoleProtectedRoute allowedRoles={["super_admin"]} > <Add_user /> </RoleProtectedRoute>}  />
          <Route path="user/edit/:id" element={ <RoleProtectedRoute allowedRoles={["super_admin"]} > <Add_user /> </RoleProtectedRoute>}  />

          <Route path="category" element={<Product_category/>} />
          <Route path="category/add" element={<Add_category/>} />
          <Route path="category/edit/:id" element={<Add_category/>} />

          <Route path="blog" element={<Blog/>}  />
          <Route path="blog/add" element={<Add_blog/>} />
          <Route path="blog/edit/:id" element={<Add_blog/>} />

          <Route path="blogAuthor" element={<BlogAuthor/>}  />
          <Route path="blogAuthor/add" element={<Add_blog_author/>} />
          <Route path="blogAuthor/edit/:id" element={<Add_blog_author/>} />
          

          <Route path="testimonials" element={<Testimonials/>} />
          <Route path="testimonials/add" element={<Add_testimonial/>} />
           <Route path="testimonials/edit/:id" element={<Add_testimonial/>} />


          <Route path="banner" element={<Banner/>} />
          <Route path="banner/add" element={<Add_banner/>} />
          <Route path="banner/edit/:id" element={<Add_banner/>} />

           <Route path="profile" element={<Profile />} />
           <Route path="login-history" element={<RoleProtectedRoute allowedRoles={["super_admin"]}>  <LoginHistory /> </RoleProtectedRoute>}  />


          <Route path="settings" element={<RoleProtectedRoute allowedRoles={["super_admin"]} > <Settings/> </RoleProtectedRoute>} />
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
