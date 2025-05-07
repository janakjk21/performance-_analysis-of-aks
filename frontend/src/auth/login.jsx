import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect to main dashboard
        const session = localStorage.getItem("session_data");
        if (session) {
            const { expires_at } = JSON.parse(session);
            if (new Date(expires_at) > new Date()) {
                navigate("/");
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await response.json();
            const expirationTime = new Date();
            expirationTime.setDate(expirationTime.getDate() + 30); // 30 days from now

            const sessionData = {
                access_token: data.access_token,
                expires_at: expirationTime.toISOString(),
            };
            localStorage.setItem("session_data", JSON.stringify(sessionData));

            setIsAuthenticated(true);
            navigate("/"); // Redirect to dashboard
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2 className="text-center">Login</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <span>Don't have an account? </span>
                        <Link to="/register">Register here</Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
