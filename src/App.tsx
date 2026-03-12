import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import Admin_dashboard from "./pages/Admin_dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from "react-toastify";
import PageEditor from "./pages/PageEditor";
import Add_page from "./components/add_page";
import Add_product from "./components/Add_product";
import Products from "./components/Products";
import User_page from "./components/User_page";
import Customer_list from "./components/Customer_list";
import Add_user from "./components/Add_user";
import Settings from "./components/Settings";
import ForgotPassword from "./forgot_password/Forgotpassword";
import ResetPassword from "./forgot_password/Reset_password";

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

          <Route path="products" element={<Products />} />
          <Route path="product/add" element={<Add_product/>} />

          <Route path="user" element={<User_page/>}  />
          <Route path="user/add" element={<Add_user/>}  />

          <Route path="Customer_list" element={<Customer_list/>} />

          <Route path="settings" element={<Settings/>} />
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
