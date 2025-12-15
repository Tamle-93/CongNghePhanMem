import { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";

export default function MyReviews() {
  const [userId, setUserId] = useState(""); // tạm thời nhập tay UUID
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null); // assignment đang chọn để review
  const [loading, setLoading] = useState(false);

  const loadMyReviews = async () => {
    if (!userId) return alert("Nhập user_id (UUID) trước");

    setLoading(true);
    try {
      const res = await fetch(`/reviews/my?user_id=${userId}`);
      const data = await res.json();

      // tùy response.py của bạn trả về {data:...} hay {result:...}
      const list = data.data || data.result || [];
      setItems(list);
    } catch (e) {
      alert("Load failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>My Reviews (Tôi được phân công)</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Nhập reviewer user_id (UUID)..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={loadMyReviews} disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>Paper</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>PDF</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x.assignment_id} style={{ borderBottom: "1px solid #333" }}>
              <td>{x.paper_title}</td>
              <td>{x.assignment_status}</td>
              <td>{x.deadline_date || "-"}</td>
              <td>
                {x.pdf_url ? (
                  <a href={x.pdf_url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <button
                  onClick={() =>
                    setSelected({
                      assignmentId: x.assignment_id,
                      pdfUrl: x.pdf_url,
                    })
                  }
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: 12, opacity: 0.7 }}>
                Chưa có dữ liệu. Nhập user_id rồi bấm Load.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div style={{ marginTop: 20 }}>
          <hr />
          <ReviewForm assignmentId={selected.assignmentId} pdfUrl={selected.pdfUrl} />
        </div>
      )}
    </div>
  );
}
