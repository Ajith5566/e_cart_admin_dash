/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
    add_banner_Api,
    updatebannerApi,
} from "../../services/allAPi";
import type { BannerResponse, BannerTypes } from "../../types/bannerTypes";


function Add_banner() {
    /*  const [_blogs, setBlogs] = useState<BlogResponse[]>([]); */
    const [loading, setLoading] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const mobileInputRef = useRef<HTMLInputElement | null>(null);

    const location = useLocation();
    const banner: BannerResponse | undefined = location.state?.banner;
    console.log(banner);


    const isEditMode = !!banner;
    const navigate = useNavigate();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [previewMobile, setpreviewMobileImage] = useState<string | null>(null);
    const [existingMobileImages, setMobileExistingImages] = useState<string[]>([]);



    const [formData, setFormData] = useState<BannerTypes>({
        title: "",
        sub_title: "",
        button_text: "",
        url: "",
        status: true,
        banner_image: null,
        mobile_image: null,
    });
    console.log(formData);
    

    const [errors, setErrors] = useState({ name: "", mobile_image: "", banner_image: "" });

    
      // Prefill form in edit mode
       useEffect(() => {
        if (!banner) return;
    
        setFormData({
          title: banner.title,
          sub_title: banner.sub_title || "",
          url:banner.url,
          button_text:banner.button_text,
          status: banner.isActive,
          banner_image:null,
             mobile_image: null
        });
    
        if (banner.banner_image) {
          setExistingImages([banner.banner_image]);
        }
        if (banner.mobile_image) {
          setMobileExistingImages([banner.mobile_image]);
        }
    
      }, [banner]);

    const validateForm = () => {
        const newErrors = { name: "", banner_image: "", mobile_image: "" };
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.name = " title is required";
            isValid = false;
        }

        if (!formData.banner_image && existingImages.length === 0) {
            newErrors.banner_image = "image required";
            isValid = false;
        }

        if (!formData.mobile_image && existingMobileImages.length === 0) {
            newErrors.mobile_image = "image required";
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

    //remove banner image
    const removeBannerImage = () => {
        setPreviewImage(null);

        setFormData((prev) => ({
            ...prev,
            banner_image: null,
        }));
    };

    //remove mobile image
    const removeMobileImage = () => {
        setpreviewMobileImage(null);

        setFormData((prev) => ({
            ...prev,
            mobile_image: null,
        }));
    };
    const removeExistingImage = () => {
        setExistingImages([]);
    };
    const removeExistingMobileImage = () => {
        setMobileExistingImages([]);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setLoading(true);

            const payload = new FormData();
            payload.append("title", formData.title.trim());
            payload.append("sub_title", formData.sub_title);
            payload.append("button_text", formData.button_text);
            payload.append("url", formData.url || "");
            payload.append("status", String(formData.status));
            payload.append("existingImage", existingImages[0] || "");


            if (formData.banner_image) {
                payload.append("banner_image", formData.banner_image);
            }
            if (formData.mobile_image) {
                payload.append("mobile_image", formData.mobile_image);
            }
            if (isEditMode) {
                await updatebannerApi(banner._id, payload);
                toast.success("Banner updated");
            } else {
                await add_banner_Api(payload);
                toast.success("Banner added");
            }

            navigate("/admin-dash/banner");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.error("Banner already exists");
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
                    {isEditMode ? "Edit banner" : "Add banner"}
                </h4>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin-dash/banner")}
                >
                    ← Back to banners
                </button>
            </div>

            <div className="row mt-5">

                {/* LEFT */}
                <div className="col-9 p-4">

                    {/* TITLE */}
                    <label className="form-label">
                        Title <span className="text-danger">*</span>
                    </label>
                    <input
                        id="title"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />
                    {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                    )}

                    {/* subtitle */}
                    <label htmlFor="author" className="form-label mt-3">
                        Sub Title
                    </label>
                    <input
                        id="sub-title"
                        className='form-control'
                        value={formData.sub_title}
                        onChange={(e) =>
                            setFormData({ ...formData, sub_title: e.target.value })
                        }
                    />

                    {/* Button Text & URL*/}
                    <div className="row mt-1">

                        <div className="col-md-6">
                            <label className="form-label">Button Text </label>
                            <input
                                id="button-text"
                                type="text"
                                className='form-control'
                                value={formData.button_text}
                                onChange={(e) =>
                                    setFormData({ ...formData, button_text: e.target.value })
                                }
                            />

                        </div>

                        <div className="col-md-6">
                            <label className="form-label">URL </label>
                            <input
                                id="url"
                                type="text"
                                className='form-control'
                                value={formData.url}
                                onChange={(e) =>
                                    setFormData({ ...formData, url: e.target.value })
                                }
                            />

                        </div>


                    </div>
                 {/* SUBMIT */}
            <div className="mt-5">
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {isEditMode ? "Update banner" : "Add banner"}
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

                    {/*Banner IMAGE */}
                    <div className="mt-4">
                        <h6>Banner Image<span className="text-danger">*</span></h6>

                        <div className="upload-box text-center p-5 border">
                            <input
                                ref={bannerInputRef}
                                type="file"
                                className="d-none"
                                id="banner-image"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setFormData((prev) => ({ ...prev, banner_image: file }));
                                    setPreviewImage(URL.createObjectURL(file));
                                }}
                            />
                            <label htmlFor="banner-image" style={{ cursor: "pointer" }}>
                                <p className="text-primary fw-semibold">
                                    Click / Drop file here to upload
                                </p>
                            </label>
                        </div>
                        {errors.banner_image && (
              <div className="invalid-feedback d-block">
                {errors.banner_image}
              </div>
            )}

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
                                    onClick={removeBannerImage}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Mobile IMAGE */}
                    <div className="mt-4">
                        <h6>Mobile Image<span className="text-danger">*</span></h6>

                        <div className="upload-box text-center p-5 border">
                            <input
                                ref={mobileInputRef}
                                type="file"
                                className="d-none"
                                id="mobile-image"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setFormData((prev) => ({ ...prev, mobile_image: file }));
                                    setpreviewMobileImage(URL.createObjectURL(file));
                                }}
                            />
                            <label htmlFor="mobile-image" style={{ cursor: "pointer" }}>
                                <p className="text-primary fw-semibold">
                                    Click / Drop file here to upload
                                </p>
                            </label>
                        </div>
                        {errors.mobile_image && (
              <div className="invalid-feedback d-block">
                {errors.mobile_image}
              </div>
            )}

                        {/* Existing image */}
                        {existingMobileImages.map((img) => (
                            <div key={img} className="mt-3">
                                <img src={img} className="img-thumbnail" alt="existing" />
                                <button
                                    className="btn btn-danger btn-sm mt-2"
                                    onClick={removeExistingMobileImage}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        {/* New image preview */}
                        {previewMobile && (
                            <div className="mt-3">
                                <img src={previewMobile} className="img-thumbnail" alt="preview" />
                                <button
                                    className="btn btn-danger btn-sm mt-2"
                                    onClick={removeMobileImage}
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

export default Add_banner;