import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Dashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get("userId");

    const [user, setUser] = useState(null);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            console.log("no userId in URL");
            setLoading(false);
            return;
        }

        // Fetch user info
        fetch(`http://localhost:3000/auth/user?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUser(data.data);
                }
            })
            .catch((err) => console.error("fetch user error:", err));

        // Fetch user's forms
        fetch(`http://localhost:3000/form-builder/user-forms?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setForms(data.data);
                }
            })
            .catch((err) => console.error("fetch forms error:", err))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (!userId) {
        return (
            <div style={{ padding: "20px" }}>
                <h2>Welcome to Form Builder</h2>
                <p>Please log in with Airtable to continue.</p>
                <button
                    onClick={() => {
                        window.location.href = "http://localhost:3000/auth/airtable";
                    }}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Login with Airtable
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard</h1>
            {user && (
                <p>
                    Welcome, <strong>{user.email}</strong>
                </p>
            )}

            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => navigate(`/form-builder?userId=${userId}`)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "10px",
                    }}
                >
                    Create New Form
                </button>
            </div>

            <div style={{ marginTop: "30px" }}>
                <h2>Your Forms</h2>
                {forms.length === 0 ? (
                    <p>No forms created yet.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {forms.map((form) => (
                            <li
                                key={form._id}
                                style={{
                                    padding: "15px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    marginBottom: "10px",
                                }}
                            >
                                <h3>{form.title}</h3>
                                <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                                <button
                                    onClick={() => navigate(`/forms/${form._id}`)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        marginRight: "10px",
                                    }}
                                >
                                    View Form
                                </button>
                                <button
                                    onClick={() => navigate(`/forms/${form._id}/responses`)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    View Responses
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Dashboard;