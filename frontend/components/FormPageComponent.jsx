import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { shouldShowQuestion } from "../utils/conditionalLogic"; // fixed path - was pointing to backend folder

function FormPageComponent() {
    const { formId } = useParams();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({}); // store user input here

    // helper to update one answer
    function handleInputChange(questionKey, value) {
        setAnswers((prev) => ({
            ...prev,
            [questionKey]: value,
        }));
    }

    useEffect(() => {
        const fetchForm = async () => {
            try {
                setLoading(true);
                setError(null);
                setForm(null);

                const response = await fetch(`http://localhost:3000/forms/${formId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error status ${response.status}`);
                }

                const data = await response.json();
                console.log("form data from backend ===>", data);

                // backend sends { success, message, data: actualForm }
                setForm(data.data); // only keep the form object
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (formId) {
            fetchForm();
        }
    }, [formId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!form) {
        return <p>Form not found.</p>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>{form.title || "Untitled Form"}</h1>

            {/* render all questions with basic inputs */}
            {Array.isArray(form.questions) && form.questions.length > 0 ? (
                <div>
                    {form.questions.map((q) => {
                        // Apply conditional logic here - NEW FEATURE ADDED
                        const isVisible = shouldShowQuestion(
                            q.conditionalRules || null,
                            answers
                        );

                        if (!isVisible) {
                            return null; // don't show this question if condition fails
                        }

                        return (
                            <div
                                key={q.questionKey}
                                style={{ marginBottom: "1.5rem" }}
                            >
                                <label
                                    style={{
                                        fontWeight: "bold",
                                        display: "block",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {q.label}
                                    {q.required && <span style={{ color: "red" }}> *</span>}
                                </label>

                                <br />

                                {/* simple type handling for now */}
                                {q.type === "longText" ? (
                                    <textarea
                                        rows={4}
                                        style={{ width: "100%", padding: "8px" }}
                                        value={answers[q.questionKey] || ""}
                                        onChange={(e) =>
                                            handleInputChange(q.questionKey, e.target.value)
                                        }
                                    />
                                ) : q.type === "singleSelect" ? (
                                    <select
                                        style={{ width: "100%", padding: "8px" }}
                                        value={answers[q.questionKey] || ""}
                                        onChange={(e) =>
                                            handleInputChange(q.questionKey, e.target.value)
                                        }
                                    >
                                        <option value="">-- Select --</option>
                                        {/* Add options here if available in q.options */}
                                    </select>
                                ) : q.type === "multiSelect" ? (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Enter comma-separated values"
                                            style={{ width: "100%", padding: "8px" }}
                                            value={answers[q.questionKey] || ""}
                                            onChange={(e) =>
                                                handleInputChange(q.questionKey, e.target.value)
                                            }
                                        />
                                    </div>
                                ) : q.type === "attachment" ? (
                                    <input
                                        type="file"
                                        style={{ width: "100%" }}
                                        onChange={(e) =>
                                            handleInputChange(
                                                q.questionKey,
                                                e.target.files[0]?.name || ""
                                            )
                                        }
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        style={{ width: "100%", padding: "8px" }}
                                        value={answers[q.questionKey] || ""}
                                        onChange={(e) =>
                                            handleInputChange(q.questionKey, e.target.value)
                                        }
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* submit button just logs data for now ,  update i changed it into backend */}
                    <button
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                        onClick={async () => {
                            try {
                                const resp = await fetch(
                                    `http://localhost:3000/forms/${formId}/responses`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ answers }), // send answers object
                                    }
                                );

                                if (!resp.ok) {
                                    const errData = await resp.json().catch(() => null);
                                    console.error("submit error:", errData || resp.status);
                                    alert("Failed to submit form");
                                    return;
                                }

                                const result = await resp.json();
                                console.log("submit success:", result);
                                alert("Form submitted!");
                                setAnswers({}); // clear form after successful submit
                            } catch (e) {
                                console.error("network error while submit:", e.message);
                                alert("Something went wrong while submitting");
                            }
                        }}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <p>No questions configured for this form.</p>
            )}
        </div>
    );
}

export default FormPageComponent;