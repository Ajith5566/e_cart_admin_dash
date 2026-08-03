import { useEffect, useState } from "react";
import { getSettingsApi, saveSettingsApi } from "../../services/allAPi";
import { toast } from "react-toastify";

type SettingsData = {
    email: string;
    phone: string;
    address: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    // ✅ NEW
    yearsOfExperience: string;
    projectsCompleted: string;
    clientSatisfaction: string;
    expertTeamMembers: string;
};

export default function Settings() {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<SettingsData>({
        email: "",
        phone: "",
        address: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
        youtube: "",
        // ✅ NEW
        yearsOfExperience: "",
        projectsCompleted: "",
        clientSatisfaction: "",
        expertTeamMembers: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        phone: ""
    });

    useEffect(() => {

        const loadSettings = async () => {

            try {

                const res = await getSettingsApi();

                if (res?.data) {

                    setFormData(res.data as SettingsData);

                }

            } catch {

                console.log("Failed loading settings");

            }

        };

        loadSettings();

    }, []);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "email" || name === "phone") {

            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));

        }
    };

    const validateForm = () => {

        const newErrors = {
            email: "",
            phone: ""
        };

        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]+$/;

        if (!emailRegex.test(formData.email)) {

            newErrors.email = "Invalid email format";
            isValid = false;

        }

        if (!phoneRegex.test(formData.phone)) {

            newErrors.phone = "Invalid phone number";
            isValid = false;

        }

        setErrors(newErrors);

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!validateForm()) return;

        try {

            setLoading(true);

            await saveSettingsApi(formData);

            toast.success("Settings updated successfully");

        } catch {

            toast.error("Update failed");

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="container p-md-4 ">

            <div>
                <h4 className="fw-bold text-dark">Settings</h4>
            </div>

                <div>

                    <div className="card-body mt-3" style={{ minHeight: "520px" }}>

                        <form noValidate onSubmit={handleSubmit}>

                            <div className="row">

                                {/* Email */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>

                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                    />

                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}

                                </div>

                                {/* Phone */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Phone <span className="text-danger">*</span>
                                    </label>

                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                    />

                                    {errors.phone && (
                                        <div className="invalid-feedback">{errors.phone}</div>
                                    )}

                                </div>

                            </div>

                            {/* Address */}
                            <div>

                                <label className='form-label'>
                                    Address <span className="text-danger">*</span>
                                </label>

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="form-control w-md-50"
                                />

                            </div>

                            <div className="mt-3">
                                <h3>Social Media Links</h3>
                            </div>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Facebook</label>
                                    <input name="facebook" value={formData.facebook} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Twitter</label>
                                    <input name="twitter" value={formData.twitter} onChange={handleChange} className="form-control" />
                                </div>

                            </div>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">LinkedIn</label>
                                    <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Instagram</label>
                                    <input name="instagram" value={formData.instagram} onChange={handleChange} className="form-control" />
                                </div>

                            </div>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Youtube</label>
                                    <input name="youtube" value={formData.youtube} onChange={handleChange} className="form-control" />
                                </div>

                            </div>

                            {/* ✅ NEW — 4 fixed counter fields */}
                            <div className="mt-3">
                                <h3>Counts</h3>
                            </div>

                            <div className="row">

                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Years of Experience</label>
                                    <input name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="form-control" placeholder="e.g. 14+" />
                                </div>

                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Projects Completed</label>
                                    <input name="projectsCompleted" value={formData.projectsCompleted} onChange={handleChange} className="form-control" placeholder="e.g. 460+" />
                                </div>

                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Client Satisfaction</label>
                                    <input name="clientSatisfaction" value={formData.clientSatisfaction} onChange={handleChange} className="form-control" placeholder="e.g. 95%" />
                                </div>

                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Expert Team Members</label>
                                    <input name="expertTeamMembers" value={formData.expertTeamMembers} onChange={handleChange} className="form-control" placeholder="e.g. 50+" />
                                </div>

                            </div>

                            <div className="mt-3 d-flex gap-2">

                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

        </div>
    );
}