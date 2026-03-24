/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePageApi,
  getAllPagesApi,
  togglePageApi,
} from "../../services/allAPi";
import { useNavigate } from "react-router-dom";
/* import Pagination from "../Pagination"; */
import '../common/common_toggle.css'
import '../common/common_styels.css'

import type { PageType } from "../../types/types";
 import PageTable from "./PageTable"; 



/* -------------------- COMPONENT -------------------- */

export default function PageEditor() {
  const navigate = useNavigate();

  const [pages, setPages] = useState<PageType[]>([]);
  console.log(pages);


  /* ---------- FETCH PAGES ---------- */

  const fetchPages =async () => {
    try {

      const res = await getAllPagesApi();
      console.log(res); 
      
      setPages(res.data);
    } catch {
      toast.error("Failed to fetch pages");
    } 
  };

    useEffect(() => {
      fetchPages();
    }, []);
  /* -------------------- UI -------------------- */

  return (
    <div className="container p-4" >
      <div className=" d-flex justify-content-between">
        <h4 className="  fw-bold text-dark">
          Page
        </h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin-dash/pages/add")}
        >
          + Add Page
        </button>
      </div>

      {/* ---------- PAGE LIST ---------- */}
      <div style={{ minHeight: "420px" }}>
            <PageTable data={pages} onEdit={(page) =>  navigate("/admin-dash/pages/add", {  state: { page }, }) }
               onToggle={async (id) => {
                 try {
                   await togglePageApi(id);
                   fetchPages();
                 } catch {
                   toast.error("Status update failed");
                 }
               }}   onDelete={async (id) => {
    if (!window.confirm("Delete this page?")) return;

    try {
      await deletePageApi(id);
      fetchPages();
      toast.success("Page deleted");
    } catch {
      toast.error("Delete failed");
    }
  }}/> 
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        {/* <Pagination
          currentPage={page}
          totalPages={totalPages}
          onChange={(newPage) => setPage(newPage)}
        /> */}
      </div>
   
    </div>
  );
}
