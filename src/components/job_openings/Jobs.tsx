// components/jobs/Jobs.tsx — with bulk actions
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteJobsApi,
  bulkToggleJobsApi,
  deleteJobApi,
  getAllJobsApi,
  toggleJobApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";
import JobTable from "./JobTable";
import { useAuth } from "../../context/useAuth";
import type { JobResponse } from "../../types/jobTypes";

export default function Jobs() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [jobs, setJobs] = useState<JobResponse[]>([]);

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
    fetchJobs();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Job Postings</h4>
        {can("jobs", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/jobs/add")}
          >
            + Post Job
          </button>
        )}
      </div>

      <JobTable
        data={jobs}
        onEdit={(job) => navigate(`/admin-dash/jobs/edit/${job._id}`)}
        canEdit={can("jobs", "update")}
        canToggle={can("jobs", "status")}
        canDelete={can("jobs", "delete")}
        onToggle={async (id) => {
          try {
            await toggleJobApi(id);
            fetchJobs();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this job posting?")) return;

          try {
            await deleteJobApi(id);
            fetchJobs();
            toast.success("Job deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        // ✅ BULK DELETE — selected (or all, when All is checked)
        onBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} job posting(s)? This cannot be undone.`))
            return;

          try {
            const res = await bulkDeleteJobsApi(ids);
            toast.success(res.data.message);
            fetchJobs();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        // ✅ BULK STATUS — deactivate/activate selected (or all)
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "activate" : "deactivate";
          if (!window.confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} ${ids.length} job posting(s)?`))
            return;

          try {
            const res = await bulkToggleJobsApi(ids, isActive);
            toast.success(res.data.message);
            fetchJobs();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}