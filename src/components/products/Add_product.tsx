// components/products/Add_product.tsx
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { AdminProduct, fetchedProducts, MetaFields } from "../../types/types";
import { AddproductApi, getAllCategoriesApi, getProductByIdApi, updateProductApi } from "../../services/allAPi";
import { useNavigate, useParams } from "react-router-dom";
import '../common/common_styels.css';
import '../products/add_products.css';
import ReactQuill from "react-quill-new";
import { Modules } from "../quillmodule";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import type { CategoryResponse } from "../../types/categoryTypes";
import Select from "react-select";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableImage({
  id,
  src,
  onRemove,
}: {
  id: string;
  src: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="position-relative"
    >
      <img
        src={src}
        className="img-thumbnail"
        style={{ width: "150px", height: "150px", objectFit: "cover", display: "block" }}
        draggable={false}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm position-absolute"
        style={{ top: "5px", right: "5px" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
      >
        X
      </button>
    </div>
  );
}

export default function Add_product() {

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const nameRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [previewImages, setPreviewImages] = useState<{ id: string; url: string; file: File }[]>([]);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
  const [meta, setMeta] = useState<MetaFields>({});
  const [loadingData, setLoadingData] = useState(!!id);

  // ✅ slug-change prompt state
  const [originalSlug, setOriginalSlug] = useState("");
  const [proposedSlug, setProposedSlug] = useState("");
  const [showSlugPrompt, setShowSlugPrompt] = useState(false);
  const [slugDecisionMade, setSlugDecisionMade] = useState(false);

  const [formData, setFormData] = useState<AdminProduct>({
    name: "",
    price: "",
    quantity: "",
    shortDescription: "",
    description: "",
    status: true,
    category: "",
    images: [],
  });

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    quantity: "",
    shortDescription: "",
    description: "",
    images: "",
    category: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  // ✅ slug / meta auto-fill + slug-change detection
  useEffect(() => {
    if (!formData.name) return;

    const generatedSlug = slugify(formData.name, { lower: true, strict: true, trim: true });

    // EDIT MODE: never silently change the slug — ask instead
    if (isEditMode && originalSlug && !slugDecisionMade) {
      if (generatedSlug !== originalSlug) {
        setProposedSlug(generatedSlug);
        setShowSlugPrompt(true);
      } else {
        // name typed back to original → dismiss prompt
        setShowSlugPrompt(false);
        setProposedSlug("");
      }
    }

    setMeta((prev) => ({
      ...prev,
      // ADD MODE: auto-slug. EDIT MODE: slug only changes via the prompt buttons.
      slug: isEditMode || slugManuallyEdited ? prev.slug : generatedSlug,
      meta_title: metaTitleManuallyEdited ? prev.meta_title : formData.name,
      meta_description: metaDescManuallyEdited
        ? prev.meta_description
        : formData.shortDescription,
    }));
  }, [
    formData.name,
    formData.shortDescription,
    slugManuallyEdited,
    metaTitleManuallyEdited,
    metaDescManuallyEdited,
    isEditMode,
    originalSlug,
    slugDecisionMade,
  ]);

  // ✅ user chose to KEEP the old slug
  const handleKeepOldSlug = () => {
    setMeta((prev) => ({ ...prev, slug: originalSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("Old URL will be kept");
  };

  // ✅ user chose to UPDATE the slug
  // (backend updateProduct archives the old slug to SlugHistory → 301 redirect)
  const handleUpdateSlug = () => {
    setMeta((prev) => ({ ...prev, slug: proposedSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("URL will be updated. Old links will redirect automatically.");
  };

  const isEditorEmpty = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length === 0;
  };

  const validateForm = () => {
    const newErrors = {
      name: "", price: "", quantity: "",
      shortDescription: "", description: "", images: "", category: "",
    };
    const qty = Number(formData.quantity);
    const price = Number(formData.price);
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Product name is required"; isValid = false; }
    if (formData.price === "" || isNaN(price) || price <= 0) { newErrors.price = "Price must be a valid positive number"; isValid = false; }
    if (formData.quantity === "" || isNaN(qty) || !Number.isInteger(qty) || qty <= 0) { newErrors.quantity = "Quantity must be a positive whole number"; isValid = false; }
    if (!formData.shortDescription.trim()) { newErrors.shortDescription = "Short description is required"; isValid = false; }
    if (!formData.description.trim() || formData.description === "<p><br></p>" || isEditorEmpty(formData.description)) { newErrors.description = "Description is required"; isValid = false; }
    if (previewImages.length === 0 && existingImages.length === 0) { newErrors.images = "At least one image required"; isValid = false; }
    if (!formData.category) { newErrors.category = "Category is required"; isValid = false; }

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

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchProduct = async () => {
      try {
        const res = await getProductByIdApi(id);
        const product: fetchedProducts = res.data;

        setFormData({
          name: product.productName,
          price: product.price,
          quantity: product.quantity,
          shortDescription: product.shortDescription,
          description: product.description,
          category: product.category?._id || "",
          status: product.isActive,
          images: [],
        });

        setExistingImages(
          (product.images || []).map((url, i) => ({ id: `existing-${i}-${url}`, url }))
        );

        if (product.meta && Object.keys(product.meta).length > 0) {
          setMeta(product.meta);
          setOriginalSlug(product.meta.slug || "");   // ✅ remember the live slug
          setSlugManuallyEdited(true);
          setMetaTitleManuallyEdited(true);
          setMetaDescManuallyEdited(true);
        }
      } catch {
        toast.error("Failed to load product");
        navigate("/admin-dash/products");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleExistingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setExistingImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handlePreviewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPreviewImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const removeExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter((img) => img.id !== id));
  };

  const removePreviewImage = (id: string) => {
    setPreviewImages(prev => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, description, shortDescription, quantity, status, category } = formData;
    if (!validateForm()) return;

    // ✅ block submit while the slug question is unanswered
    if (showSlugPrompt) {
      toast.warning("Please choose whether to keep or update the product URL");
      document.getElementById("slug-prompt")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price.toString());
    fd.append("quantity", quantity.toString());
    fd.append("description", description);
    fd.append("shortDescription", shortDescription);
    fd.append("status", String(status));
    fd.append("category", category);
    fd.append("meta", JSON.stringify(metaWithoutImages));

    previewImages.forEach((img) => fd.append("images", img.file));

    if (meta.og_image instanceof File) fd.append("og_image", meta.og_image);
    if (meta.twitter_image instanceof File) fd.append("twitter_image", meta.twitter_image);

    try {
      if (id) {
        fd.append("existingImages", JSON.stringify(existingImages.map((img) => img.url)));
        await updateProductApi(id, fd);
        toast.success("Product updated");
      } else {
        await AddproductApi(fd);
        toast.success("Product added");
      }
      navigate("/admin-dash/products");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Action failed");
      }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesApi();
        setCategories(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  if (loadingData) {
    return (
      <div className="container py-md-2">
        <div className="d-flex justify-content-between mb-3">
          <h4>{isEditMode ? "Edit Product" : "Add Product"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/products")}>
            ← Back to products
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-md-2">
      <div className="d-flex justify-content-between mb-3">
        <h4>{isEditMode ? "Edit Product" : "Add Product"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/products")}>
          ← Back to products
        </button>
      </div>

      <div className="p-md-2">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-9 col-12">
              <div>
                <label className="form-label w-100">Product Name <span className="text-danger">*</span></label>
                <input
                  id="name"
                  className={`form-control mb-1 ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  ref={nameRef}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* ✅ SLUG CHANGE PROMPT */}
              {showSlugPrompt && (
                <div id="slug-prompt" className="alert alert-info mt-2">
                  <p className="mb-2 fw-semibold">
                    The name change affects this product's URL. What would you like to do?
                  </p>
                  <p className="mb-1 small">
                    Current URL: <code>/{originalSlug}</code>
                  </p>
                  <p className="mb-3 small">
                    New URL: <code>/{proposedSlug}</code>
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleKeepOldSlug}
                    >
                      Keep old URL
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleUpdateSlug}
                    >
                      Update URL (old link will redirect)
                    </button>
                  </div>
                </div>
              )}

              <div className="row mt-1">
                <div className="col-md-6">
                  <label className="form-label">Price <span className="text-danger">*</span></label>
                  <input
                    id="price"
                    type="text"
                    className={`form-control mb-1 ${errors.price ? "is-invalid" : ""}`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Quantity <span className="text-danger">*</span></label>
                  <input
                    id="quantity"
                    type="text"
                    className={`form-control mb-1 ${errors.quantity ? "is-invalid" : ""}`}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                  {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                </div>
              </div>

              <div>
                <label htmlFor="shortDescription" className="form-label mt-3">
                  Short description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="shortDescription"
                  className={`form-control ${errors.shortDescription ? "is-invalid" : ""}`}
                  value={formData.shortDescription}
                  name="short_description"
                  rows={5}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
                {errors.shortDescription && <div className="invalid-feedback">{errors.shortDescription}</div>}

                <div id="description" className="mt-3">
                  <h6>Description <span className="text-danger">*</span></h6>
                  <ReactQuill
                    className="custom-quill"
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    modules={Modules}
                    theme="snow"
                  />
                  {errors.description && <div className="text-danger mt-1">{errors.description}</div>}
                </div>
              </div>
            </div>

            <div className="col-md-3 col-12">
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                >
                  <option value="true">Active</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="form-label mt-3">
                  Category <span className="text-danger">*</span>
                </label>
                <Select
                  options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                  value={categories.map(cat => ({ value: cat._id, label: cat.name })).find(o => o.value === formData.category)}
                  onChange={(selected) => setFormData({ ...formData, category: selected?.value || "" })}
                  isSearchable
                  className={`form-control mb-1 ${errors.category ? "is-invalid" : ""}`}
                />
                {errors.category && (
                  <div className="form-control" style={{ color: "red", border: "none" }}>{errors.category}</div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-5">
            <div>
              <h6>Image <span className="text-danger">*</span></h6>
              <p className="w-md-25 font_small text-justify">
                Preferred dimension is 300px x 450px <br />
                Allowed file types are jpg, jpeg, png, webp <br />
                Maximum allowed file size is 2 MB
              </p>
            </div>

            <div className={`upload-box text-center p-5 border ${errors.images ? "border-danger" : ""}`}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                id="images"
                className="d-none"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const totalImages = previewImages.length + existingImages.length + files.length;
                  if (totalImages > 5) { toast.error("Maximum 5 images allowed"); return; }

                  const newPreviews = files.map((file) => ({
                    id: `preview-${Date.now()}-${file.name}`,
                    url: URL.createObjectURL(file),
                    file,
                  }));
                  setPreviewImages(prev => [...prev, ...newPreviews]);

                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              <label htmlFor="images" style={{ cursor: "pointer" }}>
                <p className="mb-1">Drag and Drop image here</p>
                <p className="mb-1">Or</p>
                <p className="text-primary fw-semibold">Click to select image</p>
                <h4>+</h4>
              </label>
            </div>

            {errors.images && <div className="invalid-feedback d-block">{errors.images}</div>}

            {existingImages.length > 0 && (
              <>
                <p className="text-muted small mt-3 mb-1">Existing images — drag to reorder</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExistingDragEnd}>
                  <SortableContext items={existingImages.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                    <div className="d-flex gap-3 flex-wrap">
                      {existingImages.map((img) => (
                        <SortableImage
                          key={img.id}
                          id={img.id}
                          src={img.url}
                          onRemove={() => removeExistingImage(img.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}

            {previewImages.length > 0 && (
              <>
                <p className="text-muted small mt-3 mb-1">New images — drag to reorder</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePreviewDragEnd}>
                  <SortableContext items={previewImages.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                    <div className="d-flex gap-3 flex-wrap">
                      {previewImages.map((img) => (
                        <SortableImage
                          key={img.id}
                          id={img.id}
                          src={img.url}
                          onRemove={() => removePreviewImage(img.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </div>

          <SeoPreview
            value={meta}
            onChange={(next) => {
              setMeta(next);
              // ✅ manual slug edit in SeoPreview counts as a decision
              if (next.slug !== meta.slug) {
                setSlugDecisionMade(true);
                setShowSlugPrompt(false);
              }
            }}
            baseUrl="https://test.boilerplate.pbsmokeup.in/"
            onManualEdit={(field) => {
              if (field === "slug") setSlugManuallyEdited(true);
              if (field === "meta_title") setMetaTitleManuallyEdited(true);
              if (field === "meta_description") setMetaDescManuallyEdited(true);
            }}
          />

          <button className="btn btn-success mt-5">
            {isEditMode ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}