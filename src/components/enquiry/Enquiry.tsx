/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
/* import { useNavigate } from "react-router-dom"; */
import { useNavigate } from "react-router-dom";
import {  bulkDeleteEnquiriesApi, deleteEnquiriesApi, getAllcontactusApi,  } from "../../services/allAPi";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { toast } from "react-toastify";
/* import Pagination from "../Pagination"; */
/* import PaginationLimit from "../PaginationLimit"; */
/* import Pagination from "./Pagination"; */
/* import { useAuth } from "../../context/useAuth"; */
import EnquiryTable from "./EnquiryTable";
import type { EnquiryResponse } from "../../types/enquiryType";
export default function Enquiry() {

  const navigate = useNavigate();
  /* const { can } = useAuth(); */
  const [enquiries, setEnquiries] = useState<EnquiryResponse[]>([]);

  //pagination
  /* const [page, setPage] = useState(1); */
  /*   const [totalPages, setTotalPages] = useState(1); */
  /*  const [limit, setLimit] = useState(5) */


  const fetchEnquiries = async () => {
    try {
      const res = await getAllcontactusApi();
       console.log(res); 

      setEnquiries(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load enquires");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);





  /* ---------- SEARCH FILTER ---------- */
  /*  const filteredProducts = products.filter((item) =>
     item.productName
       .toLowerCase()
       .startsWith(search.toLowerCase())
   );
  */
  return (
    <div className="container p-md-2 ">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="  fw-bold text-dark">
          Enquiries
        </h4>
      </div>



        {/* PRODUCT LIST */}
        {/* HEADER + SEARCH */}
        
           
<EnquiryTable
  data={enquiries}
  onView={(enquiry) =>
    navigate(`/admin-dash/enquiry/view/${enquiry._id}`)
  }
  onDelete={async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await deleteEnquiriesApi(id);
      fetchEnquiries();
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Delete failed");
    }
  }}
  // ✅ BULK DELETE
  onBulkDelete={async (ids) => {
    if (!window.confirm(`Delete ${ids.length} enquiry(ies)? This cannot be undone.`))
      return;
 
    try {
      const res = await bulkDeleteEnquiriesApi(ids);
      toast.success(res.data.message);
      fetchEnquiries();
    } catch {
      toast.error("Bulk delete failed");
    }
  }}
/>
        {/* <div className="card-body table-responsive" >
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Parent category</th>
                <th>Edit</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {categories.length > 0 ? (

                categories.map((category) => (

                  <tr key={category._id} className="tableRowHeight">

                  
                    <td>{category.name}</td>
                    <td>{category.parent_category}</td>

                    
                    <td>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() =>
                          navigate("/admin-dash/category/add", {
                            state: { category },
                          })
                        }
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <label className="toggle-switch">
                        <input
                          className="toggle-input"
                          type="checkbox"
                          checked={!!category.isActive}
                          onChange={async () => {
                            try {
                              await toggleCategoryApi(category._id);
                              fetchCategories();
                            } catch {
                              toast.error("Status update failed");
                            }
                          }}
                        />
                        <span className="toggle-slider"></span>
                      </label>
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



        </div> */}
        {/* ✅ PAGINATION UI (same as PageEditor) */}
        <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">

          {/* <Pagination
            currentPage={page}
            totalPages={totalPages}
            onChange={(newPage) => setPage(newPage)}
          /> */}

        </div>
    
    </div>

  );
}
