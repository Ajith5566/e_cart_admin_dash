// components/enquiry/EnquiryView.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteEnquiriesApi, getEnquiryByIdApi } from "../../services/allAPi";
import type { EnquiryResponse } from "../../types/enquiryType";
import "../common/common_styels.css";

export default function EnquiryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState<EnquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEnquiry = async () => {
      try {
        const res = await getEnquiryByIdApi(id);
        // supports both { data: {...} } and a direct object response
        setEnquiry(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load enquiry");
        navigate("/admin-dash/enquiry");
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [id]);

  const handleDelete = async () => {
    if (!enquiry?._id) return;
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) return;

    try {
      await deleteEnquiriesApi(enquiry._id);
      toast.success("Enquiry deleted");
      navigate("/admin-dash/enquiry");
    } catch {
      toast.error("Delete failed");
    }
  };

  // e.g. "8 Jul 2026, 1:48 PM"
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

  // initials for the avatar circle
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
          <p className="text-muted mb-0">Loading enquiry...</p>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="container p-md-2">
        <div className="alert alert-warning">Enquiry not found.</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/enquiry")}
        >
          ← Back to Enquiries
        </button>
      </div>
    );
  }

  return (
    <div className="container p-md-2">
      {/* Header */}
      <div className="p-md-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <h4 className="fw-bold text-dark mb-0">Enquiry Details</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/enquiry")}
        >
          ← Back to Enquiries
        </button>
      </div>

      <div className="mx-md-3" style={{ maxWidth: "720px" }}>
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "14px", overflow: "hidden" }}
        >
          {/* Sender strip */}
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
              {initials(enquiry.name)}
            </div>

            <div className="flex-grow-1 min-width-0">
              <p className="mb-0 fw-semibold text-dark" style={{ fontSize: "16px" }}>
                {enquiry.name}
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                Received {formatDate(enquiry.createdAt)}
              </p>
            </div>
          </div>

          {/* Contact rows */}
          <div className="px-4 pt-3">
            <div
              className="d-flex justify-content-between align-items-center py-2"
              style={{ borderBottom: "1px solid #f1f3f5" }}
            >
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Email
              </span>
              <a
                href={`mailto:${enquiry.email}`}
                className="fw-medium text-decoration-none"
                style={{ fontSize: "14px" }}
              >
                {enquiry.email}
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
                href={`tel:${enquiry.phone}`}
                className="fw-medium text-decoration-none"
                style={{ fontSize: "14px" }}
              >
                {enquiry.phone}
              </a>
            </div>
          </div>

          {/* Message */}
          <div className="px-4 py-3">
            <p
              className="text-muted text-uppercase mb-2"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              Message
            </p>
            <div
              className="p-3"
              style={{
                background: "#f8f9fa",
                borderRadius: "10px",
                fontSize: "14.5px",
                lineHeight: 1.7,
                color: "#212529",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {enquiry.message}
            </div>
          </div>

          {/* Actions */}
          <div
            className="d-flex align-items-center gap-2 px-4 py-3 flex-wrap"
            style={{ background: "#f8f9fa", borderTop: "1px solid #eef0f2" }}
          >
            <a
              className="btn btn-dark btn-sm px-3"
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                "Re: Your enquiry — Phitany"
              )}&body=${encodeURIComponent(`Hi ${enquiry.name},\n\n`)}`}
            >
              Reply by email
            </a>

            <a className="btn btn-outline-dark btn-sm px-3" href={`tel:${enquiry.phone}`}>
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