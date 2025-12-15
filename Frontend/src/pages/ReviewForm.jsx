import { useState } from "react";

export default function ReviewForm({ assignmentId, pdfUrl }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentId) return alert("Missing assignmentId");

    setLoading(true);
    try {
      const res = await fetch("/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: assignmentId,
          score: Number(score),
          comment: comment,
        }),
      });

      const data = await res.json();
      alert(data.message || "Submit success");
    } catch (e) {
      alert("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h3>Submit Review</h3>

      {pdfUrl && (
        <div style={{ marginBottom: 10 }}>
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            Open PDF
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Score (0-10)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Comment</label>
          <textarea
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét cho tác giả..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
