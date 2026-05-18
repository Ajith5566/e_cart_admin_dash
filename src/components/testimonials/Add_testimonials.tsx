/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
    add_testimonial_Api,
    updatetestimonialApi,
} from "../../services/allAPi";
import type { TestimonialResponse, TestimonialTypes } from "../../types/testimonialTypes";

function Add_testimonial() {
    /*  const [_blogs, setBlogs] = useState<BlogResponse[]>([]); */
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const location = useLocation();
    const testimonial: TestimonialResponse | undefined = location.state?.testimonial;
    console.log(testimonial);


    const isEditMode = !!testimonial;
    const navigate = useNavigate();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);




    const [formData, setFormData] = useState<TestimonialTypes>({
        name: "",
        designation: "",
        message: "",
        status: true,
        image: null,
        url:""
    });
    console.log(formData);


    const [errors, setErrors] = useState({ name: "", message: "" ,url:""});



    // Prefill form in edit mode
     useEffect(() => {
     if (!testimonial) return;
 
     setFormData({
       name: testimonial.name,
       // parent_blog is a populated object, extract _id for the select value
       message: testimonial.message || "",
       designation:testimonial.designation || "",
       status: testimonial.isActive,
       image: null,
       url:testimonial.url
     });
 
     if (testimonial.image) {
       setExistingImages([testimonial.image]);
     }
 
   }, [testimonial]); 

    const validateForm = () => {
        const newErrors = { name: "", message: "",url:""};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "This field is required";
            isValid = false;
        }

        if (!formData.message.trim()) {
            newErrors.message = "This field is required";
            isValid = false;
        }

        if (!formData.url.trim()) {
            newErrors.url = "This field is required";
            isValid = false;
        }

        setErrors(newErrors);

        // NEW FEATURE — scroll to first error
        if (!isValid) {
            scrollToFirstError(newErrors);
        }
        return isValid;
    };


    //focus effect
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

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append("name", formData.name.trim());
            payload.append("message", formData.message);
            payload.append("designation", formData.designation);
            payload.append("status", String(formData.status));
            payload.append("existingImage", existingImages[0] || "");
            payload.append("url",formData.url.trim());

            if (formData.image) {
                payload.append("image", formData.image);
            }

            if (isEditMode) {
                await updatetestimonialApi(testimonial._id, payload);
                toast.success("testimonial updated");
            } else {
                await add_testimonial_Api(payload);
                toast.success("testimonial added");
            }

            navigate("/admin-dash/testimonials");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.error("testimonial already exists");
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
                    {isEditMode ? "Edit testimonial" : "Add testimonial"}
                </h4>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin-dash/testimonials")}
                >
                    ← Back to testimonials
                </button>
            </div>

            <div className="row mt-5">

                {/* LEFT */}
                <div className="col-9 p-4">

                    <div className="flex row">
                        <div className="col-6">
                            {/* NAME */}
                            <label className="form-label">
                                Name <span className="text-danger">*</span>
                            </label>
                            <input
                                id="name"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                            {errors.name && (
                                <div className="invalid-feedback">{errors.name}</div>
                            )}

                        </div>
                        <div className="col-6">
                            {/* Designation */}
                            <label className="form-label">
                                Designation
                            </label>
                            <input
                                id="designation"
                                className="form-control"
                                value={formData.designation}
                                onChange={(e) =>
                                    setFormData({ ...formData, designation: e.target.value })
                                }
                            />

                        </div>
                    </div>
                    <div className="mt-3">
                            {/* URL*/}
                            <label className="form-label">
                                URL<span className="text-danger">*</span>
                            </label>
                            <input
                                id="url"
                                 className={`form-control ${errors.url ? "is-invalid" : ""}`}
                                value={formData.url}
                                onChange={(e) =>
                                    setFormData({ ...formData, url: e.target.value })
                                }
                            />
                             {errors.url && (
                                <div className="invalid-feedback">{errors.url}</div>
                            )}

                        </div>


                    {/* Message */}
                    <label className="form-label mt-4">Message<span className="text-danger">*</span></label>
                    <textarea
                        rows={5}
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                        }
                    />
                    {errors.message && (
                        <div className="invalid-feedback">{errors.message}</div>
                    )}

                    {/* SUBMIT */}
                    <div className="mt-5" >
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {isEditMode ? "Update testimonial" : "Add testimonial"}
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

export default Add_testimonial;