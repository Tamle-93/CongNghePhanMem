import { InputNumber, Button, Input, message } from "antd";
import { useState } from "react";
import axios from "axios";

const { TextArea } = Input;

export default function ReviewForm({ assignmentId, pdfUrl }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    try {
      await axios.post("/reviews/submit", {
        assignment_id: assignmentId,
        score: score,
        comment: comment
      });
      message.success("Submit review thành công");
    } catch (err) {
      message.error("Submit review thất bại");
    }
  };

  return (
    <div>
      <a href={pdfUrl} target="_blank" rel="noreferrer">
        Xem PDF
      </a>

      <div style={{ marginTop: 10 }}>
        <InputNumber
          min={0}
          max={10}
          value={score}
          onChange={setScore}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <TextArea
          rows={4}
          placeholder="Nhập nhận xét"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button
        type="primary"
        style={{ marginTop: 10 }}
        onClick={submitReview}
      >
        Submit Review
      </Button>
    </div>
  );
}
