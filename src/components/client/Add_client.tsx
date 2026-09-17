/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
  addClientApi,
  getAllCaseStudiesApi,
  getClientByIdApi,
  updateClientApi,
} from "../../services/allAPi";
import { imgSrc } from "../../utils/imgSrc";

export default function Add_client() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [caseStudy, setcaseStudy] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [existingLogo, setExistingLogo] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [caseStudyOptions, setCaseStudyOptions] = useState<{ value: string; label: string }[]>([]);

  const [errors, setErrors] = useState({ name: "", logo: "" });


  useEffect(() => {
    const load = async () => {
      try {
        const [cs] = await Promise.all([
          getAllCaseStudiesApi(),
        ]);
        setCaseStudyOptions((cs.data.data ?? [])
          .filter((c: any) => c._id !== id)
          .map((c: any) => ({ value: c._id, label: c.title })));
      } catch {
        toast.error("Failed to load options");
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchClient = async () => {
      try {
        const res = await getClientByIdApi(id);
        const client = res.data.data ?? res.data;
        setName(client.name);
        setStatus(client.isActive);
        setExistingLogo(client.logo || "");
        setcaseStudy((client.caseStudy as any)?._id ?? "");
      } catch {
        toast.error("Failed to load client");
        navigate("/admin-dash/client");
      } finally {
        setLoadingData(false);
      }
    };

    fetchClient();
  }, [id]);

  const pickLogo = (file: File | undefined | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, logo: "Only JPG, PNG, WebP or SVG accepted" }));
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setErrors((p) => ({ ...p, logo: "Logo must be under 1 MB" }));
      return;
    }
    setErrors((p) => ({ ...p, logo: "" }));
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ✅ only name is mandatory — logo is optional
  const validateForm = () => {
    const next = { name: "", logo: "" };
    let ok = true;

    if (!name.trim()) { next.name = "Client name is required"; ok = false; }

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("status", String(status));
    fd.append("caseStudy",caseStudy);
    if (logoFile) fd.append("logo", logoFile);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateClientApi(id, fd);
        toast.success("Client updated");
      } else {
        await addClientApi(fd);
        toast.success("Client added");
      }
      navigate("/admin-dash/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const shownLogo = logoPreview || (existingLogo ? imgSrc(existingLogo) : "");

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Client" : "Add Client"}</h4>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/admin-dash/client")}
        >
          ← Back to Clients
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <div className="row">

          {/* LEFT */}
          <div className="col-md-8">
            <label htmlFor="name" className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}

            <label className="form-label mt-3">Status</label>
            <select
              className="form-control"
              style={{ maxWidth: "200px" }}
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

           <div id="caseStudy" tabIndex={-1} className="mt-3">
  <Select
    options={caseStudyOptions}
    value={caseStudyOptions.find((o) => o.value === caseStudy) ?? null}
    onChange={(v) => setcaseStudy(v?.value ?? "")}
    isClearable
    placeholder="Select case study"
    classNamePrefix="react-select"
    menuPortalTarget={document.body}
    menuPosition="fixed"
    menuPlacement="auto"
    maxMenuHeight={250}
    styles={{
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }}
  />
</div>

          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update Client" : "Add Client"}
            </button>
            {isEditMode && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate("/admin-dash/client")}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — Logo (optional) */}
        <div className="col-md-4">
          <h6>Logo <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span></h6>
          <p className="text-muted" style={{ fontSize: "12px" }}>
            JPG, PNG, WebP or SVG · Max 1 MB<br />
            Recommended: square, transparent background
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            className="d-none"
            onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }}
          />

          {shownLogo ? (
            <div>
              <div
                className="border d-flex align-items-center justify-content-center"
                style={{ width: "120px", height: "120px", borderRadius: "10px", background: "#f8f9fa" }}
              >
                <img
                  src={shownLogo}
                  alt="Logo preview"
                  style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview("");
                    setExistingLogo("");
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`upload-box text-center p-4 border ${errors.logo ? "border-danger" : ""}`}
              style={{ cursor: "pointer", borderRadius: "10px", width: "120px", height: "120px" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="mb-0 text-primary fw-semibold" style={{ fontSize: "12px" }}>
                Click to upload
              </p>
              <h5 className="mb-0">+</h5>
            </div>
          )}
          {errors.logo && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.logo}</div>}
        </div>

      </div>
    </div>
    </div >
  );
}