import express from "express";
import { getFormResponses } from "../controllers/form.controller.js";

const router = express.Router();

// Get all responses for a specific form
router.get("/:formId/responses", getFormResponses);

export default router;