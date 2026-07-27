// components/caseStudy/Add_solution.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  addSolutionApi,
  getSolutionByIdApi,
  updateSolutionApi,
} from "../../services/allAPi";

export default function Add_solution() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchSolution = async () => {
      try {
        const res = await getSolutionByIdApi(id);
        const solution = res.data.data ?? res.data;
        setName(solution.name);
        setStatus(solution.isActive);
      } catch {
        toast.error("Failed to load solution");
        navigate("/admin-dash/solution");
      } finally {
        setLoadingData(false);
      }
    };

    fetchSolution();
  }, [id]);

  const validateForm = () => {
    const next = { name: "" };
    let ok = true;

    if (!name.trim()) { next.name = "Solution name is required"; ok = false; }

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = { name: name.trim(), status };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateSolutionApi(id, payload);
        toast.success("Solution updated");
      } else {
        await addSolutionApi(payload);
        toast.success("Solution added");
      }
      navigate("/admin-dash/solution");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("A solution with this name already exists");
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
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading solution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Solution" : "Add Solution"}</h4>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/admin-dash/solution")}
        >
          ← Back to Solutions
        </button>
      </div>

      <div className="p-md-2 mb-4" style={{ maxWidth: "480px" }}>
        <label htmlFor="name" className="form-label">
          Name <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. E-Commerce Platform"
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

        <div className="mt-4 d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : isEditMode ? "Update Solution" : "Add Solution"}
          </button>
          {isEditMode && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/admin-dash/solution")}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}