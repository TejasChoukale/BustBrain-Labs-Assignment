import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ResponsesList() {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!formId) return;

        fetch(`http://localhost:3000/forms/${formId}/responses`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setResponses(data.data);
                } else {
                    setError("Failed to load responses");
                }
            })
            .catch((err) => {
                console.error("fetch responses error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [formId]);

    if (loading) {
        return <p>Loading responses...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            <h1>Form Responses</h1>

            {responses.length === 0 ? (
                <p>No responses yet.</p>
            ) : (
                <div>
                    <p>Total responses: {responses.length}</p>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "20px",
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    #
                                </th>
                                <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    Submitted At
                                </th>
                                <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    Airtable ID
                                </th>
                                <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    Status
                                </th>
                                <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    Answers
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((response, index) => (
                                <tr key={response._id}>
                                    <td
                                        style={{
                                            border: "1px solid #ddd",
                                            padding: "10px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {index + 1}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                        {new Date(response.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                        {response.airtableRecordId}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                        {response.deletedInAirtable ? (
                                            <span style={{ color: "red" }}>Deleted</span>
                                        ) : (
                                            <span style={{ color: "green" }}>Active</span>
                                        )}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                        <details>
                                            <summary style={{ cursor: "pointer" }}>
                                                View Answers
                                            </summary>
                                            <pre
                                                style={{
                                                    marginTop: "10px",
                                                    padding: "10px",
                                                    backgroundColor: "#f8f9fa",
                                                    borderRadius: "4px",
                                                    overflow: "auto",
                                                }}
                                            >
                                                {JSON.stringify(response.answers, null, 2)}
                                            </pre>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ResponsesList;