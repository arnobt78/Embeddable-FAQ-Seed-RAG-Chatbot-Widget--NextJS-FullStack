import { z } from "zod";

/** POST /api/chat request body */
export const chatPostBodySchema = z.object({
  message: z
    .string({ error: "Message required" })
    .trim()
    .min(1, "Message required")
    .max(8000, "Message too long"),
});

/** POST /api/feedback request body */
export const feedbackPostBodySchema = z
  .object({
    type: z.enum(["feedback", "issue"]),
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(5000).optional(),
    email: z.string().email().max(320).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "feedback" && data.rating === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Rating required for feedback",
        path: ["rating"],
      });
    }
  });

export type ChatPostBody = z.infer<typeof chatPostBodySchema>;
export type FeedbackPostBody = z.infer<typeof feedbackPostBodySchema>;

/** Format Zod errors for API JSON responses */
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request body";
}
