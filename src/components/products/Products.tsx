/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { fetchedProducts } from "../../types/types";
import { deleteProductApi, getAllProductsApi, toggleProductApi } from "../../services/allAPi";
import ProductTable from "./ProductTable";
import { useAuth } from "../../context/useAuth";

export default function Products() {
  const navigate = useNavigate();
  const { can, getScope, adminId } = useAuth();
  const [products, setProducts] = useState<fetchedProducts[]>([]);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    try {
      const res = await getAllProductsApi();
      setProducts(res.data);
    } catch {
      toast.error("Session expired");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // builds a per-row checker for a given action: respects "all" vs "own" vs "none"
  const buildRowCheck = (action: "update" | "status" | "delete") => (product: fetchedProducts) => {
    const scope = getScope("products", action);
    if (scope === "none") return false;
    if (scope === "all") return true;
    // scope === "own" — only allowed if this admin created this specific product
    return product.adminId === adminId;
  };

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="  fw-bold text-dark">
          Products
        </h4>
        {can("products", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/product/add")}
          >
            + Add Product
          </button>
        )}
      </div>

      {/* PRODUCT LIST */}
      <div className="card-body table-responsive" style={{ minHeight: "520px" }}>
        <ProductTable
          data={products}
          onEdit={(product) => navigate(`/admin-dash/product/edit/${product._id}`)}
          canEdit={buildRowCheck("update")}
          canToggle={buildRowCheck("status")}
          canDelete={buildRowCheck("delete")}
          onDelete={async (id) => {
            if (!window.confirm("Delete this product?")) return;

            try {
              await deleteProductApi(id);
              fetchProducts();
              toast.success("Product deleted");
            } catch {
              toast.error("Delete failed");
            }
          }}
          onToggle={async (id) => {
            try {
              await toggleProductApi(id);
              fetchProducts();
            } catch {
              toast.error("Status update failed");
            }
          }}
        />
      </div>
    </div>
  );
}