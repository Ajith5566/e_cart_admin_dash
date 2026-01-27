

import { useState } from "react";
import { toast } from "react-toastify";
import { updateProductApi } from "../services/allAPi";
import { BASE_URL } from "../services/baseURL";

// Product type (single product)
type fetchedProducts = {
  _id: string;                // MongoDB product ID
  productName: string;        // Product name
  price: number | string;     // Product price
  quantity: number | string;  // Available quantity
  image: string;              // Image filename
};

// Props received from parent component
type Props = {
  product: fetchedProducts;   // Selected product to edit
  token: string;              // Admin JWT token
  onClose: () => void;        // Close modal callback
  onSuccess: () => void;      // Refresh product list callback
};

const EditProductModal = ({ product, token, onClose, onSuccess }: Props) => {

  // Local state for form fields
  const [formData, setFormData] = useState({
    name: product.productName,   // Pre-fill product name
    price: product.price,        // Pre-fill price
    quantity: product.quantity,  // Pre-fill quantity
    image: null as File | null,  // New image (optional)
  });

  // Loading state for update button
  const [loading, setLoading] = useState(false);

  // Handle product update submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData to support image upload
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("price", formData.price.toString());
    fd.append("quantity", formData.quantity.toString());

    // Append image only if admin selected a new one
    if (formData.image) {
      fd.append("image", formData.image);
    }

    try {
      // Call backend API to update product
      await updateProductApi(product._id, fd, token);

      // Show success message
      toast.success("Product updated ✅");

      // Refresh product list in parent component
      onSuccess();

      // Close edit modal
      onClose();
    } catch {
      // Show error message on failure
      toast.error("Update failed");
    } finally {
      // Re-enable update button
      setLoading(false);
    }
  };

  return (
    // Modal wrapper (centered)
    <div className="d-flex justify-content-center align-items-center">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-4"
      >
        {/* Modal Title */}
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

        {/* Product Name Input */}
        <input
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="border p-2 w-full mb-2"
          placeholder="Product name"
        />

        {/* Price Input */}
        <input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          className="border p-2 w-full mb-2"
          placeholder="Price"
        />

        {/* Quantity Input */}
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: Number(e.target.value) })
          }
          className="border p-2 w-full mb-2"
          placeholder="Quantity"
        />

        {/* Existing Product Image Preview */}
        <img
          src={`${BASE_URL}/uploads/${product.image}`}
          alt="product"
          className="h-20 mb-2"
          height={100}
          width={100}
        />

        {/* Optional Image Replacement */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.files?.[0] || null })
          }
          className="mb-3"
        />

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          
          {/* Update Button */}
          <button
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Updating..." : "Update"}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-danger"
          >
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
};

export default EditProductModal;
