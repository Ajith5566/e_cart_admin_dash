// components/caseStudy/Services.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteServicesApi,
  bulkToggleServicesApi,
  deleteServiceApi,
  getAllServicesApi,
  toggleServiceApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { ServiceResponse } from "../../types/serviceTypes";
import ServiceTable from "./ServiceTable";

export default function Services() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [services, setServices] = useState<ServiceResponse[]>([]);

  const fetchServices = async () => {
    try {
      const res = await getAllServicesApi();
      setServices(res.data.data);
    } catch {
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Services</h4>
        {can("service", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/service/add")}
          >
            + Add Service
          </button>
        )}
      </div>

      <ServiceTable
        data={services}
        onEdit={(service) => navigate(`/admin-dash/service/edit/${service._id}`)}
        canEdit={can("service", "update")}
        canToggle={can("service", "status")}
        canDelete={can("service", "delete")}
        onToggle={async (id) => {
          try {
            await toggleServiceApi(id);
            fetchServices();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this service? The icon will also be removed.")) return;
          try {
            await deleteServiceApi(id);
            fetchServices();
            toast.success("Service deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(
            `Delete ${ids.length} service(s)? Their icons will also be removed.`
          )) return;
          try {
            const res = await bulkDeleteServicesApi(ids);
            toast.success(res.data.message);
            fetchServices();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} service(s)?`)) return;
          try {
            const res = await bulkToggleServicesApi(ids, isActive);
            toast.success(res.data.message);
            fetchServices();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}