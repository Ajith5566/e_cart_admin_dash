/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { fetchedProducts } from "../../types/types";
import { deleteProductApi, getAllProductsApi, toggleProductApi } from "../../services/allAPi";
import ProductTable from "./ProductTable";


export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<fetchedProducts[]>([]);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    try {
      const res = await getAllProductsApi();
      console.log(res);


      // 👇 IMPORTANT
      setProducts(res.data);       // backend must send docs


    } catch {
      toast.error("Session expired");
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);


  /* ---------- SEARCH FILTER ---------- */
  /*  const filteredProducts = products.filter((item) =>
     item.productName
       .toLowerCase()
       .startsWith(search.toLowerCase())
   );
  */
  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between">
        <h4 className="  fw-bold text-dark">
          Products
        </h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin-dash/product/add")}
        >
          + Add Product
        </button>
      </div>


      {/* PRODUCT LIST */}
        <div className="card-body table-responsive" style={{ minHeight: "520px" }}>
          <ProductTable data={products} onEdit={(product) => navigate("/admin-dash/product/add", { state: { product }, })}
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
