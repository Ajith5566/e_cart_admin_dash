
import React, { useEffect, useState } from "react";
import styles from "./adminProduct.module.css";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import EditProductModal from "./editProduct_modal";
import type { AdminProduct, fetchedProducts } from "../types/types";
import { AddproductApi, deleteProductApi, getAllProductsApi } from "../services/allAPi";
import { BASE_URL } from "../services/baseURL";
export default function Products() {
 const [token, setToken] = useState<string>("");
 //product list
const [products, setProducts] = useState<fetchedProducts[]>([]);

const [selectedProduct, setSelectedProduct] = useState<fetchedProducts| null>(null);

  

  const [productData, setProductData] = useState<AdminProduct>({
    name: "",
    price: "",
    quantity: "",
    image: null,
  });
  //console.log(productData);

useEffect(() => {
    const stored = sessionStorage.getItem("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(stored ?? "");
  }, []);
 //console.log(token);

 //add products
  const addProduct=async(e: React.FormEvent)=>{
    e.preventDefault();
  const { name, price, quantity, image } = productData;

  if (!name || !price || !quantity || !image) {
    return alert("Please fill all fields");
   }else{

  const reqBody = new FormData();
  reqBody.append("name", name.trim());
  reqBody.append("price", price.toString());
  reqBody.append("quantity", quantity.toString());
  reqBody.append("image", image);


  if(token){
    const reqHeader={
    'Content-Type':'multipart/form-data',
    'Authorization':`Bearer ${token} `
  }

    //api call
    try{
   const result= await AddproductApi(reqBody,reqHeader);
   console.log(result);
   if (result.status === 200) {
    toast.success("product added🎉");
    setProductData({name:"",price:"",quantity:"",image:null})
    // 🔥 AUTO UPDATE PRODUCT LIST
      fetchProducts();

   }
    }catch (error: unknown) {
          if (error instanceof AxiosError) {
            toast.error(
              error.response?.data?.message || "product already added"
            );
          } else {
            toast.error("Something went wrong");
          }
        }
   
  }

}
  }

  //get all products
const fetchProducts = async () => {
  try {
    const result = await getAllProductsApi();
    setProducts(result.data);
  } catch (err) {
    console.error("FRONTEND ERROR:", err);
  }
};
useEffect(() => {
  fetchProducts();
}, []);

//delete product
const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  if (!token) {
    toast.error("Unauthorized");
    return;
  }

  try {
    console.log(id,token);
    
    const res = await deleteProductApi(id, token);

    if (res.status === 200) {
      toast.success("Product deleted 🗑️");

      // 🔥 auto refresh list
      fetchProducts();
    }
  } catch {
    toast.error("Failed to delete product");
  }
};





  return (
    <div className={styles.classicPage}>
      {selectedProduct && (
  <EditProductModal
    product={selectedProduct}
    token={token}
    onClose={() => setSelectedProduct(null)}
    onSuccess={fetchProducts}
  />
)}
    <div className="container py-4">


      <div className="row g-4">
        {/* Add Product */}
        <div className="col-12 col-lg-4">
          <div className={`card shadow ${styles.card}`}>
            <div className={`card-header bg-primary text-white ${styles.cardHeader}`}>
              <h5 className="mb-0">Add Product</h5>
            </div>
            <div className="card-body">
              <form onSubmit={addProduct}>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    className={`form-control ${styles.input}`}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    className={`form-control ${styles.input}`}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={productData.quantity}
                    onChange={(e) => setProductData({ ...productData, quantity: e.target.value })}
                    className={`form-control ${styles.input}`}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setProductData({ ...productData, image: file });
                    }}
                    className={`form-control ${styles.input}`}
                  />
                  {productData.image && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(productData.image)}
                        alt="preview"
                        width={100}
                        height={100}
                        className={styles.previewImg}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`btn btn-success w-100 ${styles.submitBtn}`}
                >
                  Add Product
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="col-12 col-lg-8">
          <div className={`card shadow ${styles.listCard}`}>
            <div className={`card-header bg-info text-white ${styles.cardHeader}`}>
              <h5 className="mb-0">Product List ({products.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className={`table table-hover align-middle mb-0 ${styles.table}`}>
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Image</th>
                      <th scope="col">Name</th>
                      <th scope="col">Price</th>
                      <th scope="col">Qty</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((item) => (
                        <tr key={item._id} className={styles.tableRow}>
                          <td>
                            <img
                              src={`${BASE_URL}/uploads/${item.image}`}
                              alt={item.productName}
                              className={styles.tableImg}
                            />
                          </td>
                          <td>{item.productName}</td>
                          <td><strong className={styles.price}>₹{item.price}</strong></td>
                          <td>
                            <span   className={ Number(item.quantity) > 5 ? styles.inStock : styles.lowStock }>
                              {item.quantity}
                            </span>

                          </td>
                          <td>
                            <div className={`d-flex gap-2 ${styles.actions}`}>
                              <button className="btn btn-sm btn-warning"  onClick={() => setSelectedProduct(item)}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={`text-center text-muted ${styles.noData}`}>
                          No products yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    

  </div>
  );
}
