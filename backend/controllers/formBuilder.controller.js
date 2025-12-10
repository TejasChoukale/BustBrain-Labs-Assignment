import { Form } from "../models/Form.js";
import { User } from "../models/User.js";
import axios from "axios";

// Get all bases for a user
export const getUserBases = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    // Fetch bases from Airtable
    const response = await axios.get("https://api.airtable.com/v0/meta/bases", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    return res.json({
      success: true,
      data: response.data.bases,
    });
  } catch (error) {
    console.error("get bases error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to fetch bases",
    });
  }
};

// Get all tables in a base
export const getBaseTables = async (req, res) => {
  try {
    const { userId, baseId } = req.query;

    if (!userId || !baseId) {
      return res.status(400).json({
        success: false,
        message: "userId and baseId required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    // Fetch tables from Airtable
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return res.json({
      success: true,
      data: response.data.tables,
    });
  } catch (error) {
    console.error("get tables error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to fetch tables",
    });
  }
};

// Get fields from a table
export const getTableFields = async (req, res) => {
  try {
    const { userId, baseId, tableId } = req.query;

    if (!userId || !baseId || !tableId) {
      return res.status(400).json({
        success: false,
        message: "userId, baseId and tableId required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    // Fetch table schema from Airtable
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    const table = response.data.tables.find((t) => t.id === tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "table not found",
      });
    }

    // Filter only supported field types
    const supportedTypes = [
      "singleLineText",
      "multilineText",
      "singleSelect",
      "multipleSelects",
      "multipleAttachments",
    ];

    const supportedFields = table.fields.filter((field) =>
      supportedTypes.includes(field.type)
    );

    return res.json({
      success: true,
      data: supportedFields,
    });
  } catch (error) {
    console.error("get fields error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to fetch fields",
    });
  }
};

// Create a new form
export const createForm = async (req, res) => {
  try {
    const { userId, airtableBaseId, airtableTableId, title, questions } =
      req.body;

    if (!userId || !airtableBaseId || !airtableTableId || !questions) {
      return res.status(400).json({
        success: false,
        message:
          "userId, airtableBaseId, airtableTableId and questions required",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    // Create form
    const form = await Form.create({
      formOwner: userId,
      airtableBaseId,
      airtableTableId,
      title: title || "Untitled Form",
      questions,
    });

    return res.status(201).json({
      success: true,
      message: "form created successfully",
      data: form,
    });
  } catch (error) {
    console.error("create form error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to create form",
    });
  }
};

// Get all forms for a user
export const getUserForms = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    const forms = await Form.find({ formOwner: userId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: forms,
    });
  } catch (error) {
    console.error("get forms error:", error.message);
    return res.status(500).json({
      success: false,
      message: "failed to fetch forms",
    });
  }
};