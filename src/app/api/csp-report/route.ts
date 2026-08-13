import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Log the CSP violation as an Audit Log for penetration testing/monitoring
    await logAudit({
      action: "CSP_VIOLATION_REPORT",
      entity: "Security",
      details: body,
      ipAddress: ip,
    });

    console.warn("CSP Violation:", body);

    // CSP reporters do not expect any particular response body, just a 2xx status
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to parse CSP report:", error);
    return new NextResponse(null, { status: 500 });
  }
}
