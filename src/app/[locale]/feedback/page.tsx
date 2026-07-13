import type { Metadata } from "next";
import { FeedbackClient } from "./FeedbackClient";

export const metadata: Metadata = {
  title: "ข้อเสนอแนะเพิ่มเติม | DOT Academy",
  description: "แบบสำรวจความพึงพอใจและข้อเสนอแนะสำหรับกรมการท่องเที่ยว",
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
