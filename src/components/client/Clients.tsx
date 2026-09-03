/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteClientsApi,
  bulkToggleClientsApi,
  deleteClientApi,
  getAllClientsApi,
  toggleClientApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { ClientResponse } from "../../types/clientTypes";
import ClientTable from "./ClientTable";


export default function Clients() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [clients, setClients] = useState<ClientResponse[]>([]);

  const fetchClients = async () => {
    try {
      const res = await getAllClientsApi();
      setClients(res.data.data);
    } catch {
      toast.error("Failed to load clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Clients</h4>
        {can("client", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/client/add")}
          >
            + Add Client
          </button>
        )}
      </div>

      <ClientTable
        data={clients}
        onEdit={(client) => navigate(`/admin-dash/client/edit/${client._id}`)}
        canEdit={can("client", "update")}
        canToggle={can("client", "status")}
        canDelete={can("client", "delete")}
        onToggle={async (id) => {
          try {
            await toggleClientApi(id);
            fetchClients();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this client? The logo will also be removed.")) return;
          try {
            await deleteClientApi(id);
            fetchClients();
            toast.success("Client deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(
            `Delete ${ids.length} client(s)? Their logos will also be removed.`
          )) return;
          try {
            const res = await bulkDeleteClientsApi(ids);
            toast.success(res.data.message);
            fetchClients();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} client(s)?`)) return;
          try {
            const res = await bulkToggleClientsApi(ids, isActive);
            toast.success(res.data.message);
            fetchClients();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}