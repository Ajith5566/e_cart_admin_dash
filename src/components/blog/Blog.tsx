/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
/* import { useNavigate } from "react-router-dom"; */
import { useNavigate } from "react-router-dom";
import { deleteblogApi, getAllBlogsApi, toggleBlogApi } from "../../services/allAPi";
import type { BlogResponse} from "../../types/types";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { toast } from "react-toastify";
import BlogTable from "./Blog_table";
/* import Pagination from "../Pagination"; */
/* import PaginationLimit from "../PaginationLimit"; */
/* import Pagination from "./Pagination"; */

export default function Blog() {

  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogResponse[]>([]);

  //pagination
  /* const [page, setPage] = useState(1); */
  /*   const [totalPages, setTotalPages] = useState(1); */
  /*  const [limit, setLimit] = useState(5) */


  const fetchBlogs = async () => {
    try {
      const res = await getAllBlogsApi();
       console.log(res); 

      setBlogs(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
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
          Blog
        </h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin-dash/blog/add")}
        >
          + Add blog
        </button>
      </div>



        {/* PRODUCT LIST */}
        {/* HEADER + SEARCH */}
        
          <BlogTable data={blogs} onEdit={(blog) =>  navigate("/admin-dash/blog/add", {  state: { blog }, }) }
        onToggle={async (id) => {
          try {
            await toggleBlogApi(id);
            fetchBlogs();
          } catch {
            toast.error("Status update failed");
          }
        }} 
         onDelete={async (id) => {
                      if (!window.confirm("Delete this blog?")) return;
        
                      try {
                        await deleteblogApi(id);
                        fetchBlogs();
                        toast.success("Blog deleted");
                      } catch {
                        toast.error("Delete failed");
                      }
                    }}  />
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
