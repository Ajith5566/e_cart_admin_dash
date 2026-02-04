import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import Admin_dashboard from "./pages/Admin_dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import PageEditor from "./pages/PageEditor";
import Add_page from "./components/add_page";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin-dash" element={<Admin_dashboard />}>
          <Route path="pages" element={<PageEditor />} />
          <Route path="pages/add" element={<Add_page />} />
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
