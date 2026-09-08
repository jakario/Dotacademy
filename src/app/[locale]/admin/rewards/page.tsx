import { RewardsClient } from "./RewardsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผู้ได้รับรางวัล | DOT Knowledge Admin",
  description: "รายชื่อ 20 คนแรกที่สอบผ่านและได้รับรางวัล",
};

export default function AdminRewardsPage() {
  return <RewardsClient />;
}
