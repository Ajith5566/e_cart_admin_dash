/* eslint-disable react-hooks/exhaustive-deps */
import {  useEffect, useState } from "react";
/* import { useNavigate } from "react-router-dom"; */
import { useNavigate } from "react-router-dom";
import '../common/common_toggle.css';
import '../common/common_styels.css';
import { toast } from "react-toastify";
import type { FetchedAdminUser } from "../../types/types";
import { Admin_user_isActiveApi, getAdmin_UserApi } from "../../services/allAPi";
import AdminUsersTable from "./UserTable";
/* import Pagination from "./Pagination"; */

export default function Products() {

  const navigate = useNavigate();

  const [users, setUsers] = useState<FetchedAdminUser[]>([]);



  //fetch users
  const fetchUsers = async () => {

    try {

      const res = await getAdmin_UserApi();
      console.log(res);
      setUsers(res.data);


    } catch (error) {
      console.error(error);
    }

  };


  useEffect(() => {
    fetchUsers();
  }, []);






  /* ---------- SEARCH FILTER ---------- */
  /*  const filteredProducts = products.filter((item) =>
     item.productName
       .toLowerCase()
       .startsWith(search.toLowerCase())
   );
  */
  return (
    <div className="container p-md-4 ">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="  fw-bold text-dark">
          Admin Users
        </h4>
        <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/user/add")}
          >
            + Add User
          </button>
      </div>
        <div className="card-body table-responsive" >
          <AdminUsersTable data={users} onEdit={(user) =>  navigate("/admin-dash/user/add", {  state: { user}, }) }
        onToggle={async (id) => {
          try {
            await Admin_user_isActiveApi(id);
            fetchUsers();
          } catch {
            toast.error("Status update failed");
          }
        }}  />

        </div>   
    </div>
  );
}
