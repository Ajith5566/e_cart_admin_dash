import React, { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { AdminProduct, CategoryResponse, fetchedProducts } from "../../types/types";
import { AddproductApi, getAllCategoriesApi, updateProductApi } from "../../services/allAPi";
import { useLocation, useNavigate } from "react-router-dom";
import '../common/common_styels.css';
import '../products/add_products.css'
import ReactQuill from "react-quill-new";
import { Modules } from "../quillmodule";

export default function Add_product() {

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const category = location.state?.category;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // If editing product, data comes through route state
  const product = location.state?.product as fetchedProducts | undefined;

  // Stores preview URLs for UI display only
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  //for edit-image preview
  const [existingImages, setExistingImages] = useState<string[]>([]);

  //category
   const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Main form state
  const [formData, setFormData] = useState<AdminProduct>({
    name: "",
    price: "",
    quantity: "",
    shortDescription: "",
    description: "",
    status:true,
    category:"",
    images: [], // multiple image files
  });
console.log(formData);


  /* error handling */
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    quantity: "",
    shortDescription: "",
    description: "",
    images: ""
  });

  const isEditorEmpty = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length === 0;
  };


  const validateForm = () => {

    const newErrors = {
      name: "",
      price: "",
      quantity: "",
      shortDescription: "",
      description: "",
      images: ""
    };
    const qty = Number(formData.quantity);
    const price = Number(formData.price);

    let isValid = true;

    if (!formData.name.trim() || "") {
      newErrors.name = "Product name is required";
      nameRef.current?.focus();
      isValid = false;
    }

    if (
      formData.price === "" ||
      isNaN(price) ||
      price <= 0
    ) {
      newErrors.price = "Price must be a valid positive number";
      isValid = false;
    }

    if (
      formData.quantity === "" ||
      isNaN(qty) ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      newErrors.quantity = "Quantity must be a positive whole number";
      isValid = false;
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
      isValid = false;
    }

    if (!formData.description.trim() || formData.description === "<p><br></p>") {
      newErrors.description = "Description is required";
      isValid = false;
    } if (isEditorEmpty(formData.description)) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (
      formData.images.length === 0 &&
      existingImages.length === 0
    ) {
      newErrors.images = "At least one image required";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };



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
      shortDescription: product.shortDescription,
      description: product.description,
      category:product.category,
      status:product.isActive,
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
  const removeExistingImage = (index: number) => {

    setExistingImages(prev =>
      prev.filter((_, i) => i !== index)
    );

  };

  /**
   * Handle form submit (Add / Update product)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, price, description, shortDescription, quantity, images,status,category } = formData;

    // Basic validation
    if (!validateForm()) return;


    // Prepare multipart/form-data
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price.toString());
    fd.append("quantity", quantity.toString());
    fd.append("description", description);
    fd.append("shortDescription", shortDescription);
    fd.append("status", String(status));
    fd.append("category",category);

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Action failed";

      toast.error(message);
    }
  };
  const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        console.log(res);
  
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };
  
    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCategories();
    }, []);

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

      <div className=" p-4">
        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-9">
              {/* Product Name */}
              <div>
                <label className="form-label w-100">Product Name <span className="text-danger">*</span></label>
                <input
                  className={`form-control mb-1 ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  ref={nameRef}
                />

                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}

              </div>

              {/* Price & Quantity */}
              <div className="row mt-1">

                <div className="col-md-6">
                  <label className="form-label">Price <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control mb-1 ${errors.price ? "is-invalid" : ""}`}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />

                  {errors.price && (
                    <div className="invalid-feedback">{errors.price}</div>
                  )}

                </div>

                <div className="col-md-6">
                  <label className="form-label">Quantity <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control mb-1 ${errors.quantity ? "is-invalid" : ""}`}
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
                  {errors.quantity && (
                    <div className="invalid-feedback">{errors.quantity}</div>
                  )}
                </div>


              </div>
              <div>
                <label htmlFor="short_description" className='form-label mt-3'>Short description <span className="text-danger">*</span></label>
                <textarea
                  id="short_description"
                  className={`form-control ${errors.shortDescription ? "is-invalid" : ""}`}
                  value={formData.shortDescription}
                  name="short_description"
                  rows={5}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />

                {errors.shortDescription && (
                  <div className="invalid-feedback">{errors.shortDescription}</div>
                )}


                <div className='mt-3' >
                  <h6>Description <span className="text-danger">*</span></h6>
                  <Suspense fallback={<div>Loading editor...</div>}>
                    <ReactQuill
                       className="custom-quill"
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={Modules}
                      theme="snow"
                    />

                  </Suspense>
                  {errors.description && (
                    <div className="text-danger mt-1">{errors.description}</div>
                  )}
                </div>
              </div>

            </div>
            {/* RIGHT */}
            <div className="col-3">

              <div>
                {/* STATUS */}
                <label className="form-label">Status</label>
  
                <select
                  className="form-control"
                value={formData.status ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value === "true",
                  })
                } 
                >
                  <option value="true">Active</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="form-label mt-3">Category</label>

          <select
            id="category"
            className="form-control"
             value={formData.category} 
             onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            } 
          >
            <option value="">Choose Category</option>

             {categories
              .filter(cat => cat._id !== category?._id)
              .map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
          </select>
              </div>

            </div>
          </div>



          {/* Image Upload Section */}
          <div className="mt-5">

            <div>
              <h6>Image <span className="text-danger">*</span></h6>
              <p className="w-25 font_small text-justify">
                Preferred dimension is 300px x 450px <br />
                Allowed file types are jpg, jpeg, png, webp <br />
                Maximum allowed file size is 2 MB
              </p>
            </div>

            {/* Upload Box */}
            <div className={`upload-box text-center p-5 border ${errors.images ? "border-danger" : ""
              }`}>
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
            {/* Image Error Message */}
            {errors.images && (
              <div className="invalid-feedback d-block">
                {errors.images}
              </div>
            )}
            {/* edit preview */}
            {/* Existing Images */}
            <div className="d-flex gap-3 mt-3 flex-wrap">

              {existingImages.map((img, index) => (

                <div key={index} className="position-relative">

                  <img
                    src={img}
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
