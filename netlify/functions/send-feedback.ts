import type { Config } from "@netlify/functions";
import { handleFeedbackRequest } from "../../lib/send-feedback-handler";

export default async function sendFeedbackFunction(req: Request) {
  return handleFeedbackRequest(req);
}

export const config: Config = {
  path: "/send-feedback",
};
