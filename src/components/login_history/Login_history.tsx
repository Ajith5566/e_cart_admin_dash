// pages/LoginHistory.tsx
import { useEffect, useState } from "react";
import { getLoginHistoryApi } from "../../services/allAPi";
import { toast } from "react-toastify";
import type { LoginHistoryEntry } from "../../types/login_history";
import LoginHistoryTable from "./Login_historyTable";

export default function LoginHistory() {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await getLoginHistoryApi();
      console.log(res);
      
      setHistory(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load login history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Login History</h4>
      </div>

      <div className="card-body table-responsive">
        {loading ? <p>Loading...</p> : <LoginHistoryTable data={history} />}
      </div>
    </div>
  );
}