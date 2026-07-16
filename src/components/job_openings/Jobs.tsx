// components/jobs/Jobs.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteJobApi, getAllJobsApi, toggleJobApi } from "../../services/allAPi";
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
      />
    </div>
  );
}