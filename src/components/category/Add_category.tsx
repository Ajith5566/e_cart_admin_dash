/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom"; // ✅ removed useLocation
import { Modules } from "../quillmodule";
import type { MetaFields } from "../../types/types";
import {
  add_category_Api,
  getAllCategoriesApi,
  getCategoryByIdApi, // ✅ add this
  updateCategoryApi,
} from "../../services/allAPi";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import type { CategoryResponse, CategoryTypes } from "../../types/categoryTypes";

const ReactQuill = lazy(() => import("react-quill-new"));

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
  const deeperIds = childIds.flatMap((id) => getDescendantIds(allCategories, id));
  return [...childIds, ...deeperIds];
};

function Add_category() {
  const [_categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { id } = useParams();               // ✅ get id from URL
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
  const [meta, setMeta] = useState<MetaFields>({});

  const [loadingData, setLoadingData] = useState(!!id); // ✅ based on id now

  const [formData, setFormData] = useState<CategoryTypes>({
    name: "",
    parentCategory: "",
    shortDescription: "",
    description: "",
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (!formData.name) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta((prev) => ({
      ...prev,
      slug: slugManuallyEdited
        ? prev.slug
        : slugify(formData.name, { lower: true, strict: true, trim: true }),
      meta_title: metaTitleManuallyEdited ? prev.meta_title : formData.name,
      meta_description: metaDescManuallyEdited
        ? prev.meta_description
        : formData.shortDescription,
    }));
  }, [formData.name, formData.shortDescription, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited]);

  // Fetch all categories and filter out current + its descendants
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        const all: CategoryResponse[] = res.data.data;
        setCategories(all);

        if (isEditMode && id) {
          const descendantIds = getDescendantIds(all, id);
          const excluded = new Set([id, ...descendantIds]);
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

  // ✅ Fetch category by ID from API (refresh-safe)
  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchCategory = async () => {
  try {
    const res = await getCategoryByIdApi(id);
    console.log(res.data); // ✅ this is the category object directly
    
    const category: CategoryResponse = res.data.data; // ✅ no .data.data

    setFormData({
      name: category.name,
      parentCategory: category.parent_category?._id || "",
      shortDescription: category.shortDescription || "",
      description: category.description || "",
      status: category.isActive,
      image: null,
    });

    if (category.image) {
      setExistingImages([category.image]);
    }

    if (category.meta && Object.keys(category.meta).length > 0) {
      setMeta(category.meta);
      setSlugManuallyEdited(true);
      setMetaTitleManuallyEdited(true);
      setMetaDescManuallyEdited(true);
    }
  } catch {
    toast.error("Failed to load category");
    navigate("/admin-dash/category");
  } finally {
    setLoadingData(false);
  }
};
    fetchCategory();
  }, [id]);

  const validateForm = () => {
    const newErrors = { name: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) scrollToFirstError(newErrors);
    return isValid;
  };

  const scrollToFirstError = (newErrors: typeof errors) => {
    const firstErrorKey = Object.keys(newErrors).find(
      (key) => newErrors[key as keyof typeof newErrors] !== ""
    );
    if (!firstErrorKey) return;
    const element = document.getElementById(firstErrorKey);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => (element as HTMLElement).focus(), 300);
    }
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

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("shortDescription", formData.shortDescription);
      payload.append("description", formData.description);
      payload.append("parentCategory", formData.parentCategory || "");
      payload.append("status", String(formData.status));
      payload.append("existingImage", existingImages[0] || "");
      payload.append("meta", JSON.stringify(metaWithoutImages));

      if (formData.image) payload.append("image", formData.image);
      if (meta.og_image instanceof File) payload.append("og_image", meta.og_image);
      if (meta.twitter_image instanceof File) payload.append("twitter_image", meta.twitter_image);

      if (isEditMode) {
        await updateCategoryApi(id!, payload); // ✅ use id from URL
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

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit Category" : "Add Category"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/category")}>
            ← Back to category
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Category" : "Add Category"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/category")}>
          ← Back to category
        </button>
      </div>

      <div className="row mt-2">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-md-4">

          <label className="form-label">
            Name <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}

          <label htmlFor="parent_category" className="form-label mt-3">
            Parent Category
          </label>
          <select
            id="parent_category"
            className="form-control w-50"
            value={formData.parentCategory}
            onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
          >
            <option value="">Choose Category</option>
            {filteredCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <label className="form-label mt-4">Short Description</label>
          <textarea
            className="form-control"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />

          <div className="mt-4">
            <h6>Description</h6>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                className="custom-quill"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                modules={Modules}
                theme="snow"
              />
            </Suspense>
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-md-3 col-12 p-md-4">

          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
          >
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>

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

            {(previewImage || existingImages.length > 0) && (
              <div className="mt-3">
                <img
                  src={previewImage || existingImages[0]}
                  className="img-thumbnail"
                  alt="preview"
                />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={previewImage ? removeImage : removeExistingImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <SeoPreview
          value={meta}
          onChange={setMeta}
          baseUrl="https://mern-admin-sable.vercel.app/"
          onManualEdit={(field) => {
            if (field === "slug") setSlugManuallyEdited(true);
            if (field === "meta_title") setMetaTitleManuallyEdited(true);
            if (field === "meta_description") setMetaDescManuallyEdited(true);
          }}
        />
      </div>

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
  );
}

export default Add_category;