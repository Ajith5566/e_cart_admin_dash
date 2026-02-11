import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { AdminProduct, fetchedProducts } from "../types/types";
import { AddproductApi, updateProductApi } from "../services/allAPi";
import { useLocation, useNavigate } from "react-router-dom";
import './common_styels.css'
import { BASE_URL } from "../services/baseURL";

export default function Add_product() {

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // If editing product, data comes through route state
  const product = location.state?.product as fetchedProducts | undefined;

  // Stores preview URLs for UI display only
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  //for edit-image preview
  const [existingImages, setExistingImages] = useState<string[]>([]); 

  // Main form state
  const [formData, setFormData] = useState<AdminProduct>({
    name: "",
    price: "",
    quantity: "",
    images: [], // multiple image files
  });

  /**
   * Populate form when editing an existing product
   * Only runs when 'product' changes
   */
  useEffect(() => {
    if (!product) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: product.productName,
      price: product.price,
      quantity: product.quantity,
      images: [], // existing images not added here (only new uploads)
    });

     // ⭐ load existing images from DB
  setExistingImages(product.images || []);

  }, [product]);

  /**
   * Remove image preview + corresponding file from formData
   */
  const removeImage = (index: number) => {

    // Remove preview URL
    setPreviewImages(prev => prev.filter((_, i) => i !== index));

    // Remove actual file from formData.images
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };


  /* remove edit- image */
  const removeExistingImage = (index:number) => {

  setExistingImages(prev =>
    prev.filter((_, i) => i !== index)
  );

};

  /**
   * Handle form submit (Add / Update product)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, price, quantity, images } = formData;

    // Basic validation
    if (!name || !price || !quantity) {
      toast.error("Fill all fields");
      return;
    }

    // Prepare multipart/form-data
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price.toString());
    fd.append("quantity", quantity.toString());

    // Append multiple image files
    images.forEach((file) => {
      fd.append("images", file);
    });

    console.log(formData.images);

    try {

      // Update existing product
      if (product) {
         fd.append("existingImages", JSON.stringify(existingImages));
        await updateProductApi(product._id, fd);
        toast.success("Product updated");

      // Add new product
      } else {
        const result = await AddproductApi(fd);
        console.log(result);
        toast.success("Product added");
      }

      // Redirect after success
      navigate("/admin-dash/products");

    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h4>{product ? "Edit Product" : "Add Product"}</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/products")}
        >
          ← Back to products
        </button>
      </div>

      <div className="card shadow p-4">
        <form onSubmit={handleSubmit}>

          {/* Product Name */}
          <div>
            <label className="form-label">Product Name</label>
            <input
              className="form-control mb-3"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Price & Quantity */}
          <div className="row">

            <div className="col-md-6">
              <label className="form-label">Price</label>
              <input
                type="text"
                className="form-control mb-3"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Quantity</label>
              <input
                type="text"
                className="form-control mb-3"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>

          </div>

          {/* Image Upload Section */}
          <div className="mt-5">

            <div>
              <h6>Image</h6>
              <p className="w-25 font_small text-justify">
                Preferred dimension is 300px x 450px <br />
                Allowed file types are jpg, jpeg, png, webp <br />
                Maximum allowed file size is 2 MB
              </p>
            </div>

            {/* Upload Box */}
            <div className="upload-box text-center p-5 border">
              <input
               ref={fileInputRef}
                type="file"
                multiple
                id="imageUpload"
                className="d-none"
                accept="image/*"
                onChange={(e) => {

                  const files = Array.from(e.target.files || []);

                  // Add files into form state
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...files]
                  }));

                  // Create preview URLs
                  const previews = files.map(file =>
                    URL.createObjectURL(file)
                  );

                  setPreviewImages(prev => [...prev, ...previews]);

                   // ⭐ IMPORTANT FIX
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }

                }}
                
              />

              <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                <p className="mb-1">Drag and Drop image here</p>
                <p className="mb-1">Or</p>
                <p className="text-primary fw-semibold">Click to select image</p>
                <h4>+</h4>
              </label>
            </div>
            {/* edit preview */}
            {/* Existing Images */}
<div className="d-flex gap-3 mt-3 flex-wrap">

  {existingImages.map((img, index) => (

    <div key={index} className="position-relative">

      <img
        src={`${BASE_URL}/uploads/${img}`}
        className="img-thumbnail"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "cover"
        }}
      />

      <button
        type="button"
        className="btn btn-danger btn-sm position-absolute"
        style={{ top: "5px", right: "5px" }}
        onClick={() => removeExistingImage(index)}
      >
        X
      </button>

    </div>

  ))}

</div>


            {/* Preview Images */}
            <div className="d-flex gap-3 mt-3 flex-wrap">
              {previewImages.map((img, index) => (
                <div key={index} className="position-relative">

                  <img
                    src={img}
                    alt="preview"
                    className="img-thumbnail"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover"
                    }}
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: "5px", right: "5px" }}
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>

                </div>
              ))}
            </div>

          </div>

          {/* Submit button */}
          <button className="btn btn-success mt-5">
            {product ? "Update Product" : "Add Product"}
          </button>

        </form>
      </div>
    </div>
  );
}
