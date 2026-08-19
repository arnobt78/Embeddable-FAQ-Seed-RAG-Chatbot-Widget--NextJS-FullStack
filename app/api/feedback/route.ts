import { NextRequest } from "next/server";
import { getCorsHeaders } from "@/lib/api/cors";
import { feedbackPostBodySchema, formatZodError } from "@/lib/schemas";

export const runtime = "edge";

const FEEDBACK_METHODS = "POST, OPTIONS";

/**
 * POST /api/feedback — feedback and issue reports (email integration TBD)
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body: unknown = await req.json();
    const parsed = feedbackPostBodySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: formatZodError(parsed.error) }),
        {
          status: 400,
          headers: getCorsHeaders(origin, FEEDBACK_METHODS),
        }
      );
    }

    const { type, rating, comment, email } = parsed.data;

    const emailData = {
      to: process.env.FEEDBACK_EMAIL || "arnob@example.com",
      subject: `Chatbot ${type === "feedback" ? "Feedback" : "Issue Report"}`,
      text: `
Type: ${type}
${rating ? `Rating: ${rating}/5` : ""}
${comment ? `Comment: ${comment}` : ""}
${email ? `Email: ${email}` : ""}
      `.trim(),
    };

    console.log("Feedback received:", emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Thank you for your feedback!" }),
      {
        status: 200,
        headers: getCorsHeaders(origin, FEEDBACK_METHODS),
      }
    );
  } catch (error) {
    console.error("Feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit feedback" }),
      {
        status: 500,
        headers: getCorsHeaders(origin, FEEDBACK_METHODS),
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin, FEEDBACK_METHODS),
  });
}
