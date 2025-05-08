import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup, Spinner, Badge } from "react-bootstrap";
import { submitJob, checkJobStatus } from "../api/jobs";

const JobSubmitter = () => {
    const [input, setInput] = useState('');
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState(null);
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [credits, setCredits] = useState(null);

    const token = sessionStorage.getItem("access_token");

    const fetchHistory = async () => {
        try {
            const response = await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setChatHistory(data.history.map((entry) => ({
                    id: entry.id,
                    text: entry.query + (entry.result ? `\n${entry.result}` : ''),
                })));
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const fetchCredits = async () => {
        try {
            const response = await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/user/me/credits", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setCredits(data.credits);
            }
        } catch (err) {
            console.error("Failed to fetch credits:", err);
        }
    };

    const saveToHistory = async (query, result) => {
        try {
            await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query, result }),
            });
            fetchHistory(); // refresh history
        } catch (err) {
            console.error("Error saving to history:", err);
        }
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const { job_id } = await submitJob(input);
            setJobId(job_id);
            pollJobStatus(job_id, input);
        } catch (err) {
            alert("Job submission failed");
            setLoading(false);
        }
    };

    const pollJobStatus = (job_id, userInput) => {
        const interval = setInterval(async () => {
            try {
                const res = await checkJobStatus(job_id);
                setStatus(res.status);
                if (res.status === "completed" || res.status === "failed") {
                    setOutput(res.output);
                    clearInterval(interval);
                    setLoading(false);
                    if (res.status === "completed") {
                        await saveToHistory(userInput, res.output);
                        fetchCredits(); // update tokens
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
                clearInterval(interval);
            }
        }, 2000);
    };

    useEffect(() => {
        fetchHistory();
        fetchCredits();
    }, []);

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col xs={12} md={3} className="bg-light vh-100 p-3 overflow-auto">
                    <h5>
                        Chat History
                        <Badge bg="secondary" className="float-end">
                            {credits !== null ? `Tokens: ${credits}` : "Loading..."}
                        </Badge>
                    </h5>
                    <ListGroup variant="flush">
                        {chatHistory.map((entry) => (
                            <ListGroup.Item key={entry.id} style={{ whiteSpace: 'pre-wrap' }}>
                                {entry.text}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Main Panel */}
                <Col xs={12} md={9} className="p-4">
                    <h2 className="text-center mb-4">Ask DeepSeek AI</h2>

                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Type your prompt here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !input.trim()}
                        className="w-100"
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
                    </Button>

                    {status && <p className="mt-3"><strong>Status:</strong> {status}</p>}

                    {output && (
                        <Card className="mt-4">
                            <Card.Header><strong>AI Response</strong></Card.Header>
                            <Card.Body>
                                <Card.Text>{output}</Card.Text>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default JobSubmitter;
