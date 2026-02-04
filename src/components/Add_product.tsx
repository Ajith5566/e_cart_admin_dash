import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { AdminProduct, fetchedProducts } from "../types/types";
import { AddproductApi, updateProductApi } from "../services/allAPi";
import { useLocation, useNavigate } from "react-router-dom";

export default function Add_product() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product as fetchedProducts | undefined;

  const [formData, setFormData] = useState<AdminProduct>({
    name: "",
    price: "",
    quantity: "",
    image: null,
  });

  useEffect(() => {
    if (!product) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: product.productName,
      price: product.price,
      quantity: product.quantity,
      image: null,
    });
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, price, quantity, image } = formData;

    if (!name || !price || !quantity) {
      toast.error("Fill all fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price.toString());
    fd.append("quantity", quantity.toString());
    if (image) fd.append("image", image);

    try {
      if (product) {
        await updateProductApi(product._id, fd);
        toast.success("Product updated");
      } else {
        await AddproductApi(fd);
        toast.success("Product added");
      }

      navigate("/admin-dash/product");
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>{product ? "Edit Product" : "Add Product"}</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/product")}
        >
          ← Back
        </button>
      </div>

      <div className="card shadow p-4">
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="Product name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />

          <input
            type="file"
            className="form-control mb-3"
            onChange={(e) =>
              setFormData({
                ...formData,
                image: e.target.files?.[0] || null,
              })
            }
          />

          <button className="btn btn-success w-100">
            {product ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
