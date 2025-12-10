import express from "express";

const router = express.Router();

/**
 * Handle Airtable webhook events
 * Configure Airtable to call:
 *   POST {BACKEND_URL}/api/webhook/airtable
 */
export const handleAirtableWebhook = async (req, res) => {
  try {
    // Airtable usually sends JSON body with "changedTablesById" etc.
    const payload = req.body;

    console.log("Received Airtable webhook payload:");
    console.dir(payload, { depth: null });

    // TODO: Here you can:
    // - Sync changes to your local database
    // - Trigger revalidation / background jobs
    // - Log specific base/table changes

    // Always acknowledge quickly so Airtable doesn't retry
    return res.status(200).json({
      success: true,
      message: "webhook received",
    });
  } catch (error) {
    console.error("Airtable webhook error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to process webhook",
    });
  }
};

/* ---------- ROUTES ---------- */

// Endpoint Airtable will call
router.post("/airtable", handleAirtableWebhook);

export default router;
