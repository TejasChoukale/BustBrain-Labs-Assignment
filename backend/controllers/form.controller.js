import { Form } from "../models/Form.js"; // js extention i forgot in ECS it is mendatory
import { Response } from "../models/Response.js"; // your response model
import { User } from "../models/User.js";
import axios from "axios";

// Get form Logic/Function
export const getForm = async (req, res) => {
  try {
    const { formId } = req.params;
    console.log("param id:", formId);

    if (!formId) {
      return res.status(404).json({
        success: false,
        message: "form is not found in database ",
      });
    }

    const formdata = await Form.findById(formId);
    console.log(formdata);
    const allForms = await Form.find();
    console.log("forms in DB:", allForms);
    // const FormId = await Form.findById(formId).exec(); // used to enusre the promise

    // if (!FormId){
    //     return res.status(404).json({
    //     success: false,
    //     message: "form is not found in database "
    //     });
    // }
    return res.status(200).json({
      success: true,
      message: "successfully got the form for the user",
      data: formdata,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `interal server error :${error}`,
    });
  }
};

// save a response for one form
export const createFormResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; // answers from frontend

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "answers object is required",
      });
    }

    // check form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "form not found",
      });
    }

    // basic required field validation
    const missingRequired = [];
    for (const q of form.questions) {
      if (q.required) {
        const value = answers[q.questionKey];
        if (value === undefined || value === null || value === "") {
          missingRequired.push(q.label || q.questionKey);
        }
      }
    }

    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        data: { missingRequired },
      });
    }

    // Get user's access token to push to Airtable
    const user = await User.findById(form.formOwner);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "form owner not found",
      });
    }

    // Map answers to Airtable field IDs
    const airtableFields = {};
    for (const q of form.questions) {
      const answer = answers[q.questionKey];
      if (answer !== undefined && answer !== null && answer !== "") {
        // Map questionKey to airtableFieldId
        airtableFields[q.airtableFieldId] = answer;
      }
    }

    // Push to Airtable
    let airtableRecordId = null;
    try {
      const airtableResponse = await axios.post(
        `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`,
        {
          fields: airtableFields,
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      airtableRecordId = airtableResponse.data.id;
      console.log("created airtable record:", airtableRecordId);
    } catch (airtableError) {
      console.error("airtable push failed:", airtableError.message);
      // Continue to save in DB even if Airtable fails
      airtableRecordId = `local_${Date.now()}`;
    }

    // for now fake airtableRecordId (later replace when you actually push to Airtable)
    // const fakeAirtableId = `local_${Date.now()}`; // removed this line now we push to airtable

    const responseDoc = await Response.create({
      formId,
      airtableRecordId, // now using real airtable ID
      answers,
      deletedInAirtable: false,
    });

    return res.status(201).json({
      success: true,
      message: "response saved",
      data: responseDoc,
    });
  } catch (error) {
    console.error("error in createFormResponse:", error.message);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// Get all responses for a form
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