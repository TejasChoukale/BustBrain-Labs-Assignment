// App.jsx

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { Routes, Route } from "react-router-dom"; // for routing
import FormPageComponent from "../components/FormPageComponent.jsx"; // my form page
import Dashboard from "../components/Dashboard.jsx"; // NEW
import FormBuilder from "../components/FormBuilder.jsx"; // NEW
import ResponsesList from "../components/ResponsesList.jsx"; // NEW

// const port = process.env.PORT || 5001  // only for backend
const url = "http://localhost:3000/"; // backend root url

function App() {
  async function gotoBackend() {
    // just testing backend is working or not
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`response status ${response.status}`);
      }
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("error :", error.message);
    }
  }

  return (
    <>
      {/* all routes of frontend */}
      <Routes>
        {/* home route - same as your old UI */}
        <Route
          path="/"
          element={
            <div>
              <h1>Welcome to frontend</h1>
              <button onClick={gotoBackend}>backend</button>
              <div style={{ marginTop: "20px" }}>
                <p>
                  <a href="http://localhost:3000/auth/airtable">
                    Login with Airtable
                  </a>
                </p>
              </div>
            </div>
          }
        />

        {/* dashboard route - NEW */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* form builder route - NEW */}
        <Route path="/form-builder" element={<FormBuilder />} />

        {/* form route  ex: /forms/676c3c2a1234abcd */}
        <Route path="/forms/:formId" element={<FormPageComponent />} />

        {/* responses list route - NEW */}
        <Route path="/forms/:formId/responses" element={<ResponsesList />} />
      </Routes>
    </>
  );
}

export default App;