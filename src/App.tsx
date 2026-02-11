import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import Admin_dashboard from "./pages/Admin_dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import PageEditor from "./pages/PageEditor";
import Add_page from "./components/add_page";
import Add_product from "./components/Add_product";
import Products from "./components/Products";
import User_page from "./components/User_page";
import Customer_list from "./components/Customer_list";
import Add_user from "./components/Add_user";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin-dash" element={<Admin_dashboard />}>
          <Route path="pages" element={<PageEditor />} />
          <Route path="pages/add" element={<Add_page />} />

          <Route path="products" element={<Products />} />
          <Route path="product/add" element={<Add_product/>} />

          <Route path="user" element={<User_page/>}  />
          <Route path="user/add" element={<Add_user/>}  />

          <Route path="Customer_list" element={<Customer_list/>} />
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
