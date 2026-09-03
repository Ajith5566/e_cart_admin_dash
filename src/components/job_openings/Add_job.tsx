/* eslint-disable react-hooks/set-state-in-effect */
// components/jobs/Add_job.tsx
import { useEffect, useState, lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { addJobApi, getJobByIdApi, updateJobApi } from "../../services/allAPi";
import { useNavigate, useParams } from "react-router-dom";
import type { JobType } from "../../types/jobTypes";


const RichEditor = lazy(() => import("../editor/TiptapEditor"));

const JOB_TYPES: JobType[] = ["Full time", "Part time", "Contract", "Internship", "Remote"];

export default function Add_job() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setJobType] = useState<JobType>("Full time");
  const [location, setLocation] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const [errors, setErrors] = useState({
    title: "",
    experience: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const res = await getJobByIdApi(id);
        const job = res.data.data;
        setTitle(job.title);
        setExperience(job.experience);
        setJobType(job.jobType);
        setLocation(job.location);
        setSkills(job.skills || []);
        setDescription(job.description);
        setIsActive(job.isActive);
      } catch {
        toast.error("Failed to load job");
        navigate("/admin-dash/jobs");
      } finally {
        setLoadingData(false);
      }
    };

    fetchJob();
  }, [id]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (skills.some((k) => k.toLowerCase() === s.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const isEditorEmpty = (html: string) =>
    html.replace(/<[^>]+>/g, "").trim().length === 0;

  const validateForm = () => {
    const next = { title: "", experience: "", location: "", description: "" };
    let ok = true;

    if (!title.trim()) { next.title = "Job title is required"; ok = false; }
    if (!experience.trim()) { next.experience = "Experience is required"; ok = false; }
    if (!location.trim()) { next.location = "Location is required"; ok = false; }
    if (!description.trim() || description === "<p><br></p>" || isEditorEmpty(description)) {
      next.description = "Description is required"; ok = false;
    }

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const body = { title, experience, jobType, location, skills, description, isActive };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateJobApi(id, body);
        toast.success("Job updated");
      } else {
        await addJobApi(body);
        toast.success("Job posted");
      }
      navigate("/admin-dash/job");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("An active job with this title already exists");
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
          <p className="text-muted mb-0">Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Job" : "Post Job"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/job")}>
          ← Back to Jobs
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <div className="row">
          <div className="col-md-8">
            <label htmlFor="title" className="form-label">
              Job Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              className={`form-control mb-1 ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
            >
              <option value="true">Open</option>
              <option value="false">Closed</option>
            </select>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label htmlFor="experience" className="form-label">
              Experience <span className="text-danger">*</span>
            </label>
            <input
              id="experience"
              className={`form-control mb-1 ${errors.experience ? "is-invalid" : ""}`}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 3+ years"
            />
            {errors.experience && <div className="invalid-feedback">{errors.experience}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Job Type</label>
            <select
              className="form-control"
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="location" className="form-label">
              Location <span className="text-danger">*</span>
            </label>
            <input
              id="location"
              className={`form-control mb-1 ${errors.location ? "is-invalid" : ""}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kochi"
            />
            {errors.location && <div className="invalid-feedback">{errors.location}</div>}
          </div>
        </div>

        {/* Skills tag input */}
        <div className="mt-3">
          <label htmlFor="skills" className="form-label">Skills</label>
          <div className="d-flex gap-2">
            <input
              id="skills"
              className="form-control"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter (e.g. React js)"
            />
            <button type="button" className="btn btn-outline-dark" onClick={addSkill}>
              Add
            </button>
          </div>

          {skills.length > 0 && (
            <div className="d-flex gap-2 flex-wrap mt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="badge bg-dark d-inline-flex align-items-center gap-2"
                  style={{ fontSize: "13px", padding: "8px 12px" }}
                >
                  {skill}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{ fontSize: "9px" }}
                    aria-label={`Remove ${skill}`}
                    onClick={() => removeSkill(skill)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-3" id="description">
          <h6>Description <span className="text-danger">*</span></h6>
          <Suspense fallback={<div>Loading editor...</div>}>
           <RichEditor
  value={description}
  onChange={setDescription}
  placeholder="Write description..."
  minHeight={200}
  className={errors.description ? "is-invalid" : ""}
/>
          </Suspense>
          {errors.description && (
            <div className="text-danger mt-1">{errors.description}</div>
          )}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Job" : "Post Job"}
          </button>
          {isEditMode && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/admin-dash/jobs")}
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