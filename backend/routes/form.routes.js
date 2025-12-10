import express from 'express';
import {getForm, createFormResponse} from '../controllers/form.controller.js';


const router = express.Router();


router.get('/:formId',getForm); // to get the form
// router.delete('/:formId',deleteForm); // to delete the form [need change here]

// POST /forms/:formId/responses
router.post("/:formId/responses", createFormResponse);

export default router;