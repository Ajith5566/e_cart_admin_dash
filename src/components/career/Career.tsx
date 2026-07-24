// components/careers/Careers.tsx — filter icon + filter panel
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteCareersApi,
  deleteCareerApi,
  getAllCareersApi,
  getAllJobsApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";
import CareerTable from "./CareerTable";
import type { CareerResponse, CareerStatus } from "../../types/careerTypes";
import type { JobResponse } from "../../types/jobTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";

const STATUS_OPTIONS: CareerStatus[] = ["new", "shortlisted", "hired", "rejected"];

export default function Careers() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CareerResponse[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);

  // ✅ APPLIED filters — what actually filters the table
  const [statusFilter, setStatusFilter] = useState<"" | CareerStatus>("");
  const [positionFilter, setPositionFilter] = useState("");

  // ✅ DRAFT filters — what's selected inside the panel before "Apply"
  const [draftStatus, setDraftStatus] = useState<"" | CareerStatus>("");
  const [draftPosition, setDraftPosition] = useState("");

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await getAllCareersApi();
      setApplications(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    }
  };

  // ✅ fetch ALL job postings — so filter shows every posted job, not just ones with applications
  const fetchJobs = async () => {
    try {
      const res = await getAllJobsApi();
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  // close the panel when clicking outside it
  useEffect(() => {
    if (!showFilterPanel) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showFilterPanel]);

  // ✅ position options = ALL job postings (from Job Postings), not just jobTitles that already have applications
  const positions = useMemo(
    () => [...new Set(jobs.map((j) => j.title))].sort(),
    [jobs]
  );

  const filtered = useMemo(
    () =>
      applications.filter(
        (a) =>
          (!statusFilter || a.status === statusFilter) &&
          (!positionFilter || a.jobTitle === positionFilter)
      ),
    [applications, statusFilter, positionFilter]
  );

  const activeCount = (statusFilter ? 1 : 0) + (positionFilter ? 1 : 0);

  const openPanel = () => {
    // panel opens showing the currently applied filters
    setDraftStatus(statusFilter);
    setDraftPosition(positionFilter);
    setShowFilterPanel((v) => !v);
  };

  const applyFilters = () => {
    setStatusFilter(draftStatus);
    setPositionFilter(draftPosition);
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setDraftStatus("");
    setDraftPosition("");
    setStatusFilter("");
    setPositionFilter("");
    setShowFilterPanel(false);
  };

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <h4 className="fw-bold text-dark mb-0">Career Applications</h4>

        {/* ✅ FILTER ICON BUTTON + PANEL */}
        <div style={{ position: "relative" }} ref={panelRef}>
          <button
            type="button"
            className={`btn ${activeCount > 0 ? "btn-dark" : "btn-outline-secondary"} d-inline-flex align-items-center gap-2`}
            onClick={openPanel}
            aria-expanded={showFilterPanel}
            aria-label="Filters"
          >
            <FontAwesomeIcon icon={faFilter} />
            Filter
            {activeCount > 0 && (
              <span
                className="badge bg-light text-dark"
                style={{ fontSize: "11px" }}
              >
                {activeCount}
              </span>
            )}
          </button>

          {showFilterPanel && (
            <div
              className="card border-0 shadow"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "300px",
                borderRadius: "12px",
                zIndex: 1040,
              }}
            >
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Filters</h6>
                  <button
                    type="button"
                    className="btn btn-sm p-0 border-0"
                    onClick={() => setShowFilterPanel(false)}
                    aria-label="Close filters"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <label className="form-label" style={{ fontSize: "13px" }}>
                  Status
                </label>
                <select
                  className="form-select form-select-sm mb-3"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as "" | CareerStatus)}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>

                <label className="form-label" style={{ fontSize: "13px" }}>
                  Position
                </label>
                <select
                  className="form-select form-select-sm mb-3"
                  value={draftPosition}
                  onChange={(e) => setDraftPosition(e.target.value)}
                >
                  <option value="">All positions</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-dark btn-sm flex-grow-1"
                    onClick={applyFilters}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ active filter chips — visible after the panel closes */}
      {activeCount > 0 && (
        <div className="px-md-3 d-flex align-items-center gap-2 flex-wrap mb-1">
          {statusFilter && (
            <span
              className="badge bg-dark d-inline-flex align-items-center gap-2"
              style={{ fontSize: "12px", padding: "6px 10px", textTransform: "capitalize" }}
            >
              Status: {statusFilter}
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ fontSize: "8px" }}
                aria-label="Remove status filter"
                onClick={() => setStatusFilter("")}
              />
            </span>
          )}
          {positionFilter && (
            <span
              className="badge bg-dark d-inline-flex align-items-center gap-2"
              style={{ fontSize: "12px", padding: "6px 10px" }}
            >
              Position: {positionFilter}
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ fontSize: "8px" }}
                aria-label="Remove position filter"
                onClick={() => setPositionFilter("")}
              />
            </span>
          )}
          <span className="text-muted" style={{ fontSize: "13px" }}>
            Showing {filtered.length} of {applications.length}
          </span>
        </div>
      )}

      <CareerTable
        data={filtered}
        onView={(application) =>
          navigate(`/admin-dash/careers/view/${application._id}`)
        }
        onDelete={async (id) => {
          if (!window.confirm("Delete this application? The CV file will also be removed.")) return;
          try {
            await deleteCareerApi(id);
            fetchApplications();
            toast.success("Application deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        // ✅ BULK DELETE
        onBulkDelete={async (ids) => {
          if (
            !window.confirm(
              `Delete ${ids.length} application(s)? Their CV files will also be removed. This cannot be undone.`
            )
          )
            return;

          try {
            const res = await bulkDeleteCareersApi(ids);
            toast.success(res.data.message);
            fetchApplications();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
      />
    </div>
  );
}