// components/careers/CareerView.tsx — with status reason modal + history
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
import { downloadCvFile } from "../../utils/downloadCv";
import { BASE_URL } from "../../services/baseURL";

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

  // ✅ status-change modal state
  const [pendingStatus, setPendingStatus] = useState<CareerStatus | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const res = await getCareerByIdApi(id);
        setApplication(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load application");
        navigate("/admin-dash/careers");
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

  // clicking a status button opens the reason modal instead of saving directly
  const openStatusModal = (status: CareerStatus) => {
    if (!application || application.status === status) return;
    setPendingStatus(status);
    setReason("");
    setReasonError("");
  };

  const closeStatusModal = () => {
    setPendingStatus(null);
    setReason("");
    setReasonError("");
  };

  // ✅ confirm: reason required, then save and update local state + history
  const confirmStatusChange = async () => {
    if (!application || !pendingStatus) return;

    if (!reason.trim()) {
      setReasonError("Please write a reason for this status change");
      return;
    }

    try {
      setSavingStatus(true);
      const res = await updateCareerStatusApi(application._id, pendingStatus, reason.trim());
      // backend returns the updated application including the new history entry
      setApplication(res.data.data);
      toast.success(`Marked as ${pendingStatus}`);
      closeStatusModal();
    } catch {
      toast.error("Status update failed");
    } finally {
      setSavingStatus(false);
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
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

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
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/career")}>
          ← Back to Applications
        </button>
      </div>
    );
  }

  // newest first for the timeline
  const history = [...(application.statusHistory ?? [])].reverse();

  return (
    <div className="container p-md-2">
      {/* Header */}
      <div className="p-md-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <h4 className="fw-bold text-dark mb-0">Application Details</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/career")}>
          ← Back to Applications
        </button>
      </div>

      <div className="mx-md-3" style={{ maxWidth: "720px" }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: "14px", overflow: "hidden" }}>
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
            {[
              { label: "Position", node: <span className="fw-semibold" style={{ fontSize: "14px" }}>{application.jobTitle}</span> },
              { label: "Email", node: <a href={`mailto:${application.email}`} className="fw-medium text-decoration-none" style={{ fontSize: "14px" }}>{application.email}</a> },
              { label: "Phone", node: <a href={`tel:${application.phone}`} className="fw-medium text-decoration-none" style={{ fontSize: "14px" }}>{application.phone}</a> },
            ].map(({ label, node }) => (
              <div
                key={label}
                className="d-flex justify-content-between align-items-center py-2"
                style={{ borderBottom: "1px solid #f1f3f5" }}
              >
                <span className="text-muted" style={{ fontSize: "13px" }}>{label}</span>
                {node}
              </div>
            ))}
          </div>

          {/* CV block */}
          <div className="px-4 py-3">
            <p className="text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
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
                  style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
            <p className="text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              Update Status
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={`btn btn-sm px-3 ${
                    application.status === status ? "btn-dark" : "btn-outline-secondary"
                  }`}
                  style={{ textTransform: "capitalize" }}
                  disabled={application.status === status}
                  onClick={() => openStatusModal(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Status history timeline */}
          {history.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                Status History
              </p>
              <div className="d-flex flex-column gap-2">
                {history.map((entry, i) => (
                  <div
                    key={entry._id ?? i}
                    className="p-3"
                    style={{ background: "#f8f9fa", borderRadius: "10px", borderLeft: "3px solid #1a1a2e" }}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`badge ${STATUS_BADGE[entry.status]}`}
                        style={{ textTransform: "capitalize", fontSize: "11px" }}
                      >
                        {entry.status}
                      </span>
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        {formatDate(entry.changedAt)}
                      </span>
                    </div>
                    <p className="mb-0" style={{ fontSize: "13.5px", color: "#333", lineHeight: 1.5 }}>
                      {entry.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

            <a className="btn btn-outline-dark btn-sm px-3" href={`tel:${application.phone}`}>
              Call
            </a>

            <button className="btn btn-outline-danger btn-sm px-3 ms-auto" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ✅ REASON MODAL */}
      {pendingStatus && (
        <div
          onClick={closeStatusModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1050,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Status change reason"
            className="card border-0 shadow"
            style={{ borderRadius: "14px", width: "100%", maxWidth: "480px" }}
          >
            <div className="p-4">
              <h5 className="fw-bold mb-1">
                Mark as{" "}
                <span
                  className={`badge ${STATUS_BADGE[pendingStatus]}`}
                  style={{ textTransform: "capitalize", fontSize: "13px", verticalAlign: "middle" }}
                >
                  {pendingStatus}
                </span>
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: "13.5px" }}>
                {application.name} — {application.jobTitle}
              </p>

              <label htmlFor="status-reason" className="form-label" style={{ fontSize: "14px" }}>
                Reason <span className="text-danger">*</span>
              </label>
              <textarea
                id="status-reason"
                className={`form-control ${reasonError ? "is-invalid" : ""}`}
                rows={4}
                value={reason}
                autoFocus
                placeholder={
                  pendingStatus === "rejected"
                    ? "e.g. Experience doesn't match the requirement"
                    : pendingStatus === "shortlisted"
                    ? "e.g. Strong React portfolio, schedule first-round interview"
                    : "Write the reason for this change..."
                }
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
                disabled={savingStatus}
              />
              {reasonError && <div className="invalid-feedback">{reasonError}</div>}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary"
                  onClick={closeStatusModal}
                  disabled={savingStatus}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-dark"
                  onClick={confirmStatusChange}
                  disabled={savingStatus}
                >
                  {savingStatus ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}