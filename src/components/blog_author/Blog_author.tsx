import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteAuthorsApi,
  bulkToggleAuthorsApi,
  deleteAuthorApi,
  getAllauthorsApi,
  toggleAuthorApi,
} from "../../services/allAPi";
import { toast } from "react-toastify";
import AuthorTable from "./Author_table";
import { useAuth } from "../../context/useAuth";
import type { AuthorResponse } from "../../types/author_types";
 
export default function BlogAuthor() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
 
  const fetchAuthors = async () => {
    try {
      const res = await getAllauthorsApi();
      setAuthors(res.data.data);
    } catch {
      toast.error("Failed to load authors");
    }
  };
 
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAuthors(); }, []);
 
  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Author's</h4>
        {can("author", "create") && (
          <button className="btn btn-success" onClick={() => navigate("/admin-dash/blogAuthor/add")}>
            + Add Author
          </button>
        )}
      </div>
 
      <AuthorTable
        data={authors}
        onEdit={(author) => navigate(`/admin-dash/blogAuthor/edit/${author._id}`)}
        canEdit={can("author", "update")}
        canToggle={can("author", "status")}
        canDelete={can("author", "delete")}
        onToggle={async (id) => {
          try { await toggleAuthorApi(id); fetchAuthors(); }
          catch { toast.error("Status update failed"); }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this author? Their image will also be removed.")) return;
          try { await deleteAuthorApi(id); fetchAuthors(); toast.success("Author deleted"); }
          catch { toast.error("Delete failed"); }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} author(s)? Their images will also be removed.`)) return;
          try {
            const res = await bulkDeleteAuthorsApi(ids);
            toast.success(res.data.message);
            fetchAuthors();
          } catch { toast.error("Bulk delete failed"); }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} author(s)?`)) return;
          try {
            const res = await bulkToggleAuthorsApi(ids, isActive);
            toast.success(res.data.message);
            fetchAuthors();
          } catch { toast.error("Bulk status update failed"); }
        }}
      />
    </div>
  );
}