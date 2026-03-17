/* eslint-disable react-hooks/exhaustive-deps */
import {  useEffect, useState } from "react";
/* import { useNavigate } from "react-router-dom"; */
import ProductSearch from "../Search_bar";
import { useNavigate } from "react-router-dom";
import {  getAllCategoriesApi, toggleCategoryApi } from "../../services/allAPi";
import type { CategoryResponse} from "../../types/types";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { toast } from "react-toastify";
import Pagination from "../Pagination";
import PaginationLimit from "../PaginationLimit";
/* import Pagination from "./Pagination"; */

export default function Product_category() {

  const navigate = useNavigate();

   const [categories, setCategories] = useState<CategoryResponse[]>([]);

  //pagination
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5)

  const [search, setSearch] = useState("");


        const fetchCategories = async () => {
            try {
                const res = await getAllCategoriesApi();
                console.log(res);

                setCategories(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load categories");
            }
        };

    useEffect(() => {
        fetchCategories();
    }, []);





  /* ---------- SEARCH FILTER ---------- */
  /*  const filteredProducts = products.filter((item) =>
     item.productName
       .toLowerCase()
       .startsWith(search.toLowerCase())
   );
  */
  return (
    <div className="container p-4 ">
      <div className="p-3 d-flex justify-content-between">
        <h4 className="  fw-bold text-dark">
          Category
        </h4>
        <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/category/add")}
          >
            + Add Category
          </button>
      </div>


      <div className="container">

        {/* PRODUCT LIST */}
        {/* HEADER + SEARCH */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-3 p-3">
          <PaginationLimit limit={limit} onChange={(newLimit) => { setLimit(newLimit); setPage(1); }} />

          <div className="d-flex gap-2 justify-content-center align-items-center p-2">
            <h6>Search:</h6>
            <ProductSearch value={search} onChange={setSearch} />

          </div>
        </div>
        <div className="card-body table-responsive" >
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

                    {/* Name */}
                    <td>{category.name}</td>
                    <td>{category.parent_category}</td>

                    {/* Edit */}
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

                    {/* Status Toggle */}
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
  );
}
