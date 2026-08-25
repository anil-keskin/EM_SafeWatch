import { handleFeedbackRequest } from "@/lib/send-feedback-handler";

export const runtime = "nodejs";

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(req: Request) {
  return handleFeedbackRequest(req);
}
