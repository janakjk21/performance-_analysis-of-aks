import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";

const Maindashboard = () => {
    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [keyword, setKeyword] = useState("test");
    const [chatHistory, setChatHistory] = useState([]);
    const navigate = useNavigate();

    // Logout logic
    const handleLogout = () => {
        sessionStorage.removeItem("access_token");
        navigate("/login");
    };

    // Fetch images from Openverse
    const fetchImages = async (query) => {
        try {
            const response = await fetch(`https://api.openverse.org/v1/images/?q=${query}`, {
                headers: {
                    Authorization: "Bearer <Openverse API token>", // Replace with your real token
                },
            });
            const data = await response.json();
            const validImages = data.results.filter((image) => image.url);
            setImages(validImages.slice(0, 20));
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    // Fetch chat history
    const fetchHistory = async () => {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/history", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch history");

            const data = await response.json();
            setChatHistory(data.history.map((entry) => ({ id: entry.id, text: entry.text })));
        } catch (error) {
            console.error("Error fetching history:", error);
            alert(error.message);
        }
    };

    // Post a new search to backend
    const postHistory = async (query) => {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("https://my-fastapi-app-3389.azurewebsites.net/api/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: query }),
            });

            if (!response.ok) throw new Error("Failed to save history");

            fetchHistory();
        } catch (error) {
            console.error("Error saving history:", error);
            alert(error.message);
        }
    };

    // Delete a specific history entry
    const deleteHistory = async (id) => {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`https://my-fastapi-app-3389.azurewebsites.net/api/history/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete history");

            fetchHistory();
        } catch (error) {
            console.error("Error deleting history:", error);
            alert(error.message);
        }
    };

    // Handle search
    const handleSearch = () => {
        if (searchQuery.trim() === "") return;
        setKeyword(searchQuery);
        fetchImages(searchQuery);
        postHistory(searchQuery);
        setSearchQuery("");
    };

    // On mount, check for token and fetch history
    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
        } else {
            fetchHistory();
        }
    }, [navigate]);

    // On keyword change, fetch images
    useEffect(() => {
        fetchImages(keyword);
    }, [keyword]);

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col xs={12} md={3} className="bg-light vh-100 p-3">
                    <h5>Chat History</h5>
                    <ListGroup>
                        {chatHistory.map((entry) => (
                            <ListGroup.Item key={entry.id} className="d-flex justify-content-between align-items-center">
                                {entry.text}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => deleteHistory(entry.id)}
                                >
                                    Delete
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Main Content */}
                <Col xs={12} md={9}>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <h1>Image Gallery</h1>
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>

                    <Row className="mb-4 mt-3">
                        <Col xs={12} md={8} className="mb-2">
                            <Form.Control
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for images..."
                            />
                        </Col>
                        <Col xs={12} md={4}>
                            <Button
                                onClick={handleSearch}
                                variant="primary"
                                className="w-100"
                            >
                                Search
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        {images.map((image, index) => (
                            <Col xs={12} md={4} lg={3} key={index} className="mb-4">
                                <Card>
                                    <Card.Img variant="top" src={image.url} alt={image.title} />
                                    <Card.Body>
                                        <Card.Title>{image.title}</Card.Title>
                                        <Card.Text>
                                            {image.description || "No description available"}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default Maindashboard;
