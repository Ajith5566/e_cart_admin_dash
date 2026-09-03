/* eslint-disable react-hooks/set-state-in-effect */
// components/blogs/Blogs.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteBlogsApi,
  bulkToggleBlogsApi,
  deleteblogApi,
  getAllBlogsApi,
  toggleBlogApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";
import type { BlogResponse } from "../../types/blogTypes";
import BlogTable from "./Blog_table";
import BlogFaqModal from "../blog_author/Blogfaqmodal";

export default function Blogs() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [faqModalFor, setFaqModalFor] = useState<BlogResponse | null>(null);

  const fetchBlogs = async () => {
    try {
      const res = await getAllBlogsApi();
      setBlogs(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Blogs</h4>
        {can("blog", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/blog/add")}
          >
            + Add Blog
          </button>
        )}
      </div>

      <BlogTable
        data={blogs}
        onEdit={(blog) => navigate(`/admin-dash/blog/edit/${blog._id}`)}
        canEdit={can("blog", "update")}
         canFaqs={can("blog", "update")}
        canToggle={can("blog", "status")}
        canDelete={can("blog", "delete")}
        onFaqs={(blog) => setFaqModalFor(blog)}
        onToggle={async (id) => {
          if (!window.confirm("Are you sure you want to change the status of this blog?")) return;
          try {
            await toggleBlogApi(id);
            fetchBlogs();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this blog? Its image will also be removed.")) return;

          try {
            await deleteblogApi(id);
            fetchBlogs();
            toast.success("Blog deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        // ✅ BULK DELETE
        onBulkDelete={async (ids) => {
          if (
            !window.confirm(
              `Delete ${ids.length} blog(s)? Their images, SEO meta and slug redirects will also be removed. This cannot be undone.`
            )
          )
            return;

          try {
            const res = await bulkDeleteBlogsApi(ids);
            toast.success(res.data.message);
            fetchBlogs();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        // ✅ BULK STATUS
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} blog(s)?`)) return;

          try {
            const res = await bulkToggleBlogsApi(ids, isActive);
            toast.success(res.data.message);
            fetchBlogs();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />

      {faqModalFor && (
              <BlogFaqModal
                blogId={faqModalFor._id}
                blogTitle={faqModalFor.title}
                initialFaqs={faqModalFor.faqs ?? []}
                onClose={() => setFaqModalFor(null)}
                onSaved={(faqs) =>
                  setBlogs((prev) => prev.map((s) => (s._id === faqModalFor._id ? { ...s, faqs } : s)))
                }
              />
            )}
    </div>
  );
}