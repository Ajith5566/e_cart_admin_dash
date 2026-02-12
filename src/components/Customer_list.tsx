import  { useCallback, useEffect, useState } from 'react'
import Pagination from './Pagination'
import { blockUserApi, getAllusersApi } from '../services/allAPi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/types';

function Customer_list() {
 // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  /* ================= STATE ================= */
  const [users, setUsers] = useState<User[]>([]);



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
     {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    }
  }, [ page, fetchUsers]);




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
  return (
    <>
        {/* USERS TABLE */}
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-white border-0 pb-0">
                        <h5 className="mb-3 fw-semibold text-dark"></h5>
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
                                        className={`badge fs-6 fw-semibold px-3 py-2 rounded-pill ${item.isBlocked
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
                                        className={`btn btn-sm fw-semibold px-4 ${item.isBlocked
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
                          {/* pagination */}
                          <div className="d-flex justify-content-center align-items-center mb-2 mt-2">
                            <Pagination
                              currentPage={page}
                              totalPages={totalPages}
                              onChange={(newPage) => setPage(newPage)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
    </>
  )
}

export default Customer_list