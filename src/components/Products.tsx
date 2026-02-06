/* eslint-disable react-hooks/exhaustive-deps */
import  { useEffect, useState } from "react";
import styles from "./adminProduct.module.css";
import { toast } from "react-toastify";
import type { fetchedProducts } from "../types/types";
import {
  deleteProductApi,
  getAllProductsApi,
} from "../services/allAPi";
import { BASE_URL } from "../services/baseURL";
import { useNavigate } from "react-router-dom";
import ProductSearch from "./Search_bar";
import Pagination from "./Pagination";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<fetchedProducts[]>([]);
  const [search, setSearch] = useState("");

  /* ✅ PAGINATION STATE */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    try {
      const res = await getAllProductsApi(page, 5, search);
      console.log(res);
      

      // 👇 IMPORTANT
      setProducts(res.data.docs);       // backend must send docs
      setTotalPages(res.data.totalPages);

    } catch {
      toast.error("Session expired");
    }
  };

useEffect(() => {
  setPage(1);
}, [search]);

useEffect(() => {
  fetchProducts();
}, [page, search]);




  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProductApi(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

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
                onClick={() => navigate("/admin-dash/product/add")}
              >
                + Add Product
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
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {products.length ? (
                  products.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <img
                          src={`${BASE_URL}/uploads/${item.image}`}
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
