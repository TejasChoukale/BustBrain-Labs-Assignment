import { Response } from "../models/Response.js";

export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await Response.find({ formId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      message: "responses fetched",
      data: responses,
    });
  } catch (error) {
    console.error("error in getFormResponses:", error.message);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
