/* eslint-disable react-hooks/exhaustive-deps */
import  {  useCallback, useEffect, useState } from "react";
import styles from "./adminProduct.module.css";
/* import { useNavigate } from "react-router-dom"; */
import ProductSearch from "./Search_bar";
import { useNavigate } from "react-router-dom";
import { Admin_user_isActiveApi, deleteAdmin_userApi, getAdmin_UserApi } from "../services/allAPi";
import type {  FetchedAdminUser, GetUserResponse } from "../types/types";
import './common_toggle.css'
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import type { AxiosResponse } from "axios";
/* import Pagination from "./Pagination"; */

export default function Products() {

   const navigate = useNavigate(); 
 
    const [users, setUsers]=useState<FetchedAdminUser[]>([]);

    //pagination
     const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");


  //fetch users
    const fetchUsers = useCallback( async () => {

      try {

        const res=(await getAdmin_UserApi(page,5,search))as AxiosResponse<GetUserResponse>;
        console.log(res);
        setUsers(res.data.docs);
      setTotalPages(res.data.totalPages);
        

      } catch (error) {
        console.error(error);
      }

    },[page,search]);


useEffect(() => {
  fetchUsers();
}, [fetchUsers]);



useEffect(() => {
  setPage(1);
}, [search]);






  /* ---------- SEARCH FILTER ---------- */
 /*  const filteredProducts = products.filter((item) =>
    item.productName
      .toLowerCase()
      .startsWith(search.toLowerCase())
  );
 */
  return (
    <div className={styles.classicPage}>
      
            <div className="d-flex justify-content-end p-3">
              <button
                className="btn btn-success"
                 onClick={() => navigate("/admin-dash/user/add")} 
              >
                + Add User
              </button>
            </div>
      <div className="container py-4">

        {/* HEADER + SEARCH */}
        <div className="d-flex justify-content-end align-items-center mb-3">

          <div className="d-flex gap-2 justify-content-center align-items-center">
            <h6>Search:</h6>
            <ProductSearch value={search} onChange={setSearch} />

          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className={`card shadow ${styles.listCard}`} style={{minHeight:"650px"}}>
          <div className="card-body table-responsive" >
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Edit</th>
                  <th>Status</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>

                {users.length > 0 ? (

                  users.map((user) => (

                    <tr key={user._id}>

                      {/* Name */}
                      <td>{user.name}</td>

                      {/* Edit */}
                      <td>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            navigate("/admin-dash/user/add", {
                              state: { user },
                            })
                          } 
                        >
                          Edit
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td>
                        <label className="toggle-switch">
                          <input
                          className="toggle-input"
                            type="checkbox"
                            checked={!!user.isActive}
                                onChange={async () => {
                                try {
                                    await Admin_user_isActiveApi(user._id);
                                            fetchUsers()
                                          } catch {
                                                  toast.error("Status update failed");
                                          }
                                  }}
                          />
                          <span  className="toggle-slider"></span>
                        </label>
                      </td>

                      {/* Delete */}
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={async () => {
                            if (!window.confirm("Delete this page?")) return;
                              await deleteAdmin_userApi(user._id);
                                  fetchUsers();
                                }}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No users found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

           

          </div>
           {/* ✅ PAGINATION UI (same as PageEditor) */}
             <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onChange={(newPage) => setPage(newPage)}
                />

            </div> 

        </div>
      </div>
    </div>
  );
}
