// components/careers/CareerView.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteCareerApi,
  getCareerByIdApi,
  updateCareerStatusApi,
} from "../../services/allAPi";
import type { CareerResponse, CareerStatus } from "../../types/careerTypes";
import "../common/common_styels.css";
import { BASE_URL } from "../../services/baseURL";
import { downloadCvFile } from "../../utils/downloadCv";

const STATUS_OPTIONS: CareerStatus[] = ["new", "shortlisted", "hired", "rejected"];

const STATUS_BADGE: Record<CareerStatus, string> = {
  new: "bg-primary",
  shortlisted: "bg-warning text-dark",
  hired: "bg-success",
  rejected: "bg-secondary",
};

export default function CareerView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState<CareerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const res = await getCareerByIdApi(id);
        setApplication(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load application");
        navigate("/admin-dash/career");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleDownloadCv = async () => {
    if (!application) return;
    try {
      setDownloading(true);
      await downloadCvFile(BASE_URL, application._id, application.cvFileName);
    } catch {
      toast.error("Failed to download CV");
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (status: CareerStatus) => {
    if (!application) return;
    const previous = application.status;
    setApplication({ ...application, status }); // optimistic

    try {
      setUpdatingStatus(true);
      await updateCareerStatusApi(application._id, status);
      toast.success(`Marked as ${status}`);
    } catch {
      setApplication({ ...application, status: previous }); // rollback
      toast.error("Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    if (!window.confirm("Delete this application? The CV file will also be removed.")) return;

    try {
      await deleteCareerApi(application._id);
      toast.success("Application deleted");
      navigate("/admin-dash/career");
    } catch {
      toast.error("Delete failed");
    }
  };

  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

  const initials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  if (loading) {
    return (
      <div className="container p-md-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container p-md-2">
        <div className="alert alert-warning">Application not found.</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/career")}
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="container p-md-2">
      {/* Header */}
      <div className="p-md-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <h4 className="fw-bold text-dark mb-0">Application Details</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/career")}
        >
          ← Back to Applications
        </button>
      </div>

      <div className="mx-md-3" style={{ maxWidth: "720px" }}>
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "14px", overflow: "hidden" }}
        >
          {/* Applicant strip */}
          <div
            className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ background: "#f8f9fa", borderBottom: "1px solid #eef0f2" }}
          >
            <div
              className="d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#1a1a2e",
                fontSize: "17px",
                letterSpacing: "0.5px",
              }}
              aria-hidden="true"
            >
              {initials(application.name)}
            </div>

            <div className="flex-grow-1">
              <p className="mb-0 fw-semibold text-dark" style={{ fontSize: "16px" }}>
                {application.name}
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                Applied {formatDate(application.createdAt)}
              </p>
            </div>

            <span
              className={`badge ${STATUS_BADGE[application.status]}`}
              style={{ textTransform: "capitalize", fontSize: "12px" }}
            >
              {application.status}
            </span>
          </div>

          {/* Detail rows */}
          <div className="px-4 pt-3">
            <div
              className="d-flex justify-content-between align-items-center py-2"
              style={{ borderBottom: "1px solid #f1f3f5" }}
            >
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Position
              </span>
              <span className="fw-semibold" style={{ fontSize: "14px" }}>
                {application.jobTitle}
              </span>
            </div>

            <div
              className="d-flex justify-content-between align-items-center py-2"
              style={{ borderBottom: "1px solid #f1f3f5" }}
            >
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Email
              </span>
              <a
                href={`mailto:${application.email}`}
                className="fw-medium text-decoration-none"
                style={{ fontSize: "14px" }}
              >
                {application.email}
              </a>
            </div>

            <div
              className="d-flex justify-content-between align-items-center py-2"
              style={{ borderBottom: "1px solid #f1f3f5" }}
            >
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Phone
              </span>
              <a
                href={`tel:${application.phone}`}
                className="fw-medium text-decoration-none"
                style={{ fontSize: "14px" }}
              >
                {application.phone}
              </a>
            </div>
          </div>

          {/* CV block */}
          <div className="px-4 py-3">
            <p
              className="text-muted text-uppercase mb-2"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              Resume
            </p>
            <div
              className="d-flex align-items-center justify-content-between gap-3 p-3"
              style={{ background: "#f8f9fa", borderRadius: "10px" }}
            >
              <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                <span style={{ fontSize: "20px" }} aria-hidden="true">📄</span>
                <span
                  className="fw-medium"
                  style={{
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {application.cvFileName || "cv.pdf"}
                </span>
              </div>
              <button
                className="btn btn-dark btn-sm px-3 flex-shrink-0"
                onClick={handleDownloadCv}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download CV"}
              </button>
            </div>
          </div>

          {/* Status workflow */}
          <div className="px-4 pb-3">
            <p
              className="text-muted text-uppercase mb-2"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              Update Status
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={`btn btn-sm px-3 ${
                    application.status === status
                      ? "btn-dark"
                      : "btn-outline-secondary"
                  }`}
                  style={{ textTransform: "capitalize" }}
                  disabled={updatingStatus || application.status === status}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div
            className="d-flex align-items-center gap-2 px-4 py-3 flex-wrap"
            style={{ background: "#f8f9fa", borderTop: "1px solid #eef0f2" }}
          >
            <a
              className="btn btn-dark btn-sm px-3"
              href={`mailto:${application.email}?subject=${encodeURIComponent(
                `Re: Your application for ${application.jobTitle} — Phitany`
              )}&body=${encodeURIComponent(`Hi ${application.name},\n\n`)}`}
            >
              Reply by email
            </a>

            <a
              className="btn btn-outline-dark btn-sm px-3"
              href={`tel:${application.phone}`}
            >
              Call
            </a>

            <button
              className="btn btn-outline-danger btn-sm px-3 ms-auto"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}