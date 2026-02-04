import React, { useEffect, useState } from "react";
import styles from "./adminProduct.module.css";
import { toast } from "react-toastify";
import type { fetchedProducts } from "../types/types";
import {
  deleteProductApi,
  getAllProductsApi,
} from "../services/allAPi";
import { BASE_URL } from "../services/baseURL";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<fetchedProducts[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProductsApi();
      setProducts(res.data);
    } catch {
      toast.error("Session expired");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

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

  return (
    <div className={styles.classicPage}>
      <div className="container py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4>Products</h4>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/product/add")}
          >
            + Add Product
          </button>
        </div>

        {/* PRODUCT LIST */}
        <div className={`card shadow ${styles.listCard}`}>
          <div className="card-body table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Action</th>
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
                        <div className="d-flex gap-2">
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
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
