/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Modules } from "../quillmodule";
import type { CategoryResponse, CategoryTypes } from "../../types/types";
import {
  add_category_Api,
  getAllCategoriesApi,
  updateCategoryApi,
} from "../../services/allAPi";

const ReactQuill = lazy(() => import("react-quill-new"));

// Recursively get all descendant IDs of a given category
const getDescendantIds = (
  allCategories: CategoryResponse[],
  parentId: string
): string[] => {
  const children = allCategories.filter((cat) => {
    const pid =
      typeof cat.parent_category === "object"
        ? cat.parent_category?._id
        : cat.parent_category;
    return pid === parentId;
  });

  const childIds = children.map((cat) => cat._id);
  const deeperIds = childIds.flatMap((id) =>
    getDescendantIds(allCategories, id)
  );

  return [...childIds, ...deeperIds];
};

function Add_category() {
  const [_categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const category: CategoryResponse | undefined = location.state?.category;

  const isEditMode = !!category;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CategoryTypes>({
    name: "",
    parentCategory: "",
    shortDescription: "",
    description: "",
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: "" });

  // Fetch all categories and filter out current + its descendants
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        const all: CategoryResponse[] = res.data.data;
        setCategories(all);

        if (isEditMode && category?._id) {
          const descendantIds = getDescendantIds(all, category._id);
          const excluded = new Set([category._id, ...descendantIds]);
          setFilteredCategories(all.filter((cat) => !excluded.has(cat._id)));
        } else {
          setFilteredCategories(all);
        }
      } catch {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Prefill form in edit mode
  useEffect(() => {
    if (!category) return;

    setFormData({
      name: category.name,
      // parent_category is a populated object, extract _id for the select value
      parentCategory: category.parent_category?._id || "",
      shortDescription: category.shortDescription || "",
      description: category.description || "",
      status: category.isActive,
      image: null,
    });

    if (category.image) {
      setExistingImages([category.image]);
    }
  }, [category]);

  const validateForm = () => {
    const newErrors = { name: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const removeExistingImage = () => {
    setExistingImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("shortDescription", formData.shortDescription);
      payload.append("description", formData.description);
      payload.append("parentCategory", formData.parentCategory || "");
      payload.append("status", String(formData.status));
      payload.append("existingImage", existingImages[0] || "");

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (isEditMode) {
        await updateCategoryApi(category._id, payload);
        toast.success("Category updated");
      } else {
        await add_category_Api(payload);
        toast.success("Category added");
      }

      navigate("/admin-dash/category");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Category already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">
          {isEditMode ? "Edit Category" : "Add Category"}
        </h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/category")}
        >
          ← Back to category
        </button>
      </div>

      <div className="row mt-5">

        {/* LEFT */}
        <div className="col-9 p-4">

          {/* NAME */}
          <label className="form-label">
            Name <span className="text-danger">*</span>
          </label>
          <input
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name}</div>
          )}

          {/* PARENT CATEGORY */}
          <label htmlFor="parent_category" className="form-label mt-3">
            Parent Category
          </label>
          <select
            id="parent_category"
            className="form-control w-50"
            value={formData.parentCategory}
            onChange={(e) =>
              setFormData({ ...formData, parentCategory: e.target.value })
            }
          >
            <option value="">Choose Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* SHORT DESC */}
          <label className="form-label mt-4">Short Description</label>
          <textarea
            className="form-control"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
          />

          {/* DESCRIPTION */}
          <div className="mt-4">
            <h6>Description</h6>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                modules={Modules}
                theme="snow"
              />
            </Suspense>
          </div>

          {/* SUBMIT */}
          <div className="mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {isEditMode ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-3 p-4">

          {/* STATUS */}
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status ? "true" : "false"}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value === "true" })
            }
          >
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>

          {/* IMAGE */}
          <div className="mt-4">
            <h6>Image</h6>
            <p className="font_small text-justify">
              Preferred dimension is 300px x 450px.
              Allowed file types: jpg, jpeg, png, webp.
              Maximum file size: 2 MB.
            </p>

            <div className="upload-box text-center p-5 border">
              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                id="imageUpload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFormData((prev) => ({ ...prev, image: file }));
                  setPreviewImage(URL.createObjectURL(file));
                }}
              />
              <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                <p className="text-primary fw-semibold">
                  Click / Drop file here to upload
                </p>
              </label>
            </div>

            {/* Existing image */}
            {existingImages.map((img) => (
              <div key={img} className="mt-3">
                <img src={img} className="img-thumbnail" alt="existing" />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={removeExistingImage}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* New image preview */}
            {previewImage && (
              <div className="mt-3">
                <img src={previewImage} className="img-thumbnail" alt="preview" />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={removeImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add_category;