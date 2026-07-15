// components/careers/Careers.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCareerApi, getAllCareersApi } from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";
import CareerTable from "./CareerTable";
import type { CareerResponse } from "../../types/careerTypes";

export default function Careers() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CareerResponse[]>([]);

  const fetchApplications = async () => {
    try {
      // ✅ careers endpoint — the old version was calling getAllcontactusApi
      // (the CONTACT form API), so this list would show enquiries, not applications
      const res = await getAllCareersApi();
      setApplications(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Career Applications</h4>
      </div>

      <CareerTable
        data={applications}
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
      />
    </div>
  );
}