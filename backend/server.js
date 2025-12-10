import express from "express";
import cors from "cors";
import "dotenv/config"; // eariler it was absent so i was not able to load .env varibles
import mongoose from "mongoose";
import formRoutes from "./routes/form.routes.js";
import authRoutes from "./routes/auth.routes.js";
import formBuilderRoutes from "./routes/formBuilder.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import responseRoutes from "./routes/response.routes.js";

const port = process.env.PORT || 3001;
const mongoDBURL = process.env.MONGODB_URI;

const app = express(); // creating instance of express obj
app.use(cors()); // this needed
app.use(express.json());

//mounting the routes
app.use("/forms", formRoutes);
app.use("/auth", authRoutes);
app.use("/form-builder", formBuilderRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/responses", responseRoutes);

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("MONGODB CONNECTION SUCCESSFULL");
  })
  .catch((err) => {
    console.error("got an error ", err);
    console.log("Starting server WITHOUT MongoDB (temp for dev)");
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`server started at port ${port}`);
    });
  });
