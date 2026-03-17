/* eslint-disable react-hooks/exhaustive-deps */
import {  useState } from "react";
/* import { BASE_URL } from "../services/baseURL"; */
import { useNavigate } from "react-router-dom";
import ProductSearch from "../Search_bar";
/* import Pagination from "./Pagination";
import PaginationLimit from "./PaginationLimit"; */

export default function Products() {
  const navigate = useNavigate();


  const [search, setSearch] = useState("");

  return (
    <div className="container p-4">
      <div className="p-3">
        <h4 className="  fw-bold text-dark">
          Products
        </h4>
      </div>


      {/* PRODUCT LIST */}
     
        <div className="d-flex justify-content-end p-3">
         
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/product/add")}
          >
            + Add Product
          </button>
        </div>
        <div className="container py-4">
          {/* HEADER + SEARCH */}
          <div className="d-flex justify-content-between align-items-center mb-3">
               {/* <PaginationLimit limit={limit} onChange={(newLimit)=>{setLimit(newLimit); setPage(1); }}/> */}
            <div className="d-flex gap-2 justify-content-center align-items-center">
              <h6>Search:</h6>
              <ProductSearch value={search} onChange={setSearch} />

            </div>
          </div>
          <div className="card-body table-responsive" style={{ minHeight: "520px" }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

             {/*  <tbody>
                {products.length ? (
                  products.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <img
                          src={item.images?.length
                            ? `${BASE_URL}/uploads/${item.images[0]}`
                            : "/no-image.png"}
                          className={styles.tableImg}
                          alt=""
                        />
                      </td>
                      <td>{item.productName}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            navigate("/admin-dash/product/add", {
                              state: { product: item },
                            })
                          }
                        >
                          Edit
                        </button>
                      </td>
                      <td>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No matching products found
                    </td>
                  </tr>
                )}
              </tbody> */}
            </table>



          </div>
          

        </div>
        {/* ✅ PAGINATION UI (same as PageEditor) */}
          <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap">

           {/*  <Pagination
              currentPage={page}
              totalPages={totalPages}
              onChange={(newPage) => setPage(newPage)}
            /> */}

          </div>
      
    </div>
  );
}
