import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function FormBuilder() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get("userId");

    const [bases, setBases] = useState([]);
    const [tables, setTables] = useState([]);
    const [fields, setFields] = useState([]);

    const [selectedBase, setSelectedBase] = useState("");
    const [selectedTable, setSelectedTable] = useState("");
    const [formTitle, setFormTitle] = useState("");
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (!userId) return;

        // Fetch user's bases
        fetch(`http://localhost:3000/form-builder/bases?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBases(data.data);
                }
            })
            .catch((err) => console.error("fetch bases error:", err));
    }, [userId]);

    useEffect(() => {
        if (!selectedBase) return;

        // Fetch tables for selected base
        fetch(
            `http://localhost:3000/form-builder/tables?userId=${userId}&baseId=${selectedBase}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTables(data.data);
                }
            })
            .catch((err) => console.error("fetch tables error:", err));
    }, [selectedBase, userId]);

    useEffect(() => {
        if (!selectedTable) return;

        // Fetch fields for selected table
        fetch(
            `http://localhost:3000/form-builder/fields?userId=${userId}&baseId=${selectedBase}&tableId=${selectedTable}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setFields(data.data);
                }
            })
            .catch((err) => console.error("fetch fields error:", err));
    }, [selectedTable, selectedBase, userId]);

    const addQuestion = (field) => {
        // Map Airtable field type to our supported types
        let questionType = "shortText";
        if (field.type === "multilineText") questionType = "longText";
        if (field.type === "singleSelect") questionType = "singleSelect";
        if (field.type === "multipleSelects") questionType = "multiSelect";
        if (field.type === "multipleAttachments") questionType = "attachment";

        const newQuestion = {
            questionKey: `q_${Date.now()}`,
            airtableFieldId: field.id,
            label: field.name,
            type: questionType,
            required: false,
            conditionalRules: null,
        };

        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const createForm = async () => {
        if (!formTitle || questions.length === 0) {
            alert("Please provide form title and at least one question");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:3000/form-builder/create",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        airtableBaseId: selectedBase,
                        airtableTableId: selectedTable,
                        title: formTitle,
                        questions,
                    }),
                }
            );

            const data = await response.json();
            if (data.success) {
                alert("Form created successfully!");
                navigate(`/dashboard?userId=${userId}`);
            } else {
                alert("Failed to create form");
            }
        } catch (error) {
            console.error("create form error:", error);
            alert("Error creating form");
        }
    };

    if (!userId) {
        return <p>Please log in first</p>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Form Builder</h1>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Form Title:
                </label>
                <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{ width: "100%", padding: "8px" }}
                    placeholder="Enter form title"
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Select Base:
                </label>
                <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    style={{ width: "100%", padding: "8px" }}
                >
                    <option value="">-- Select Base --</option>
                    {bases.map((base) => (
                        <option key={base.id} value={base.id}>
                            {base.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedBase && (
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                        Select Table:
                    </label>
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="">-- Select Table --</option>
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                {table.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedTable && (
                <div style={{ marginBottom: "20px" }}>
                    <h3>Available Fields:</h3>
                    {fields.map((field) => (
                        <button
                            key={field.id}
                            onClick={() => addQuestion(field)}
                            style={{
                                padding: "5px 10px",
                                margin: "5px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Add: {field.name} ({field.type})
                        </button>
                    ))}
                </div>
            )}

            <div style={{ marginTop: "30px" }}>
                <h3>Form Questions:</h3>
                {questions.length === 0 ? (
                    <p>No questions added yet</p>
                ) : (
                    questions.map((q, index) => (
                        <div
                            key={q.questionKey}
                            style={{
                                padding: "15px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                marginBottom: "15px",
                            }}
                        >
                            <div style={{ marginBottom: "10px" }}>
                                <label>Label:</label>
                                <input
                                    type="text"
                                    value={q.label}
                                    onChange={(e) =>
                                        updateQuestion(index, "label", e.target.value)
                                    }
                                    style={{ width: "100%", padding: "5px" }}
                                />
                            </div>

                            <div style={{ marginBottom: "10px" }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={q.required}
                                        onChange={(e) =>
                                            updateQuestion(index, "required", e.target.checked)
                                        }
                                    />{" "}
                                    Required
                                </label>
                            </div>

                            <p>Type: {q.type}</p>

                            <button
                                onClick={() => removeQuestion(index)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={createForm}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "20px",
                }}
            >
                Create Form
            </button>
        </div>
    );
}

export default FormBuilder;