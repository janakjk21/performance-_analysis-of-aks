import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";

const Maindashboard = () => {
    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [keyword, setKeyword] = useState("test"); // Default keyword
    const [chatHistory, setChatHistory] = useState([]); // Chat history state

    // Fetch images from Openverse API
    const fetchImages = async (query) => {
        try {
            const response = await fetch(`https://api.openverse.org/v1/images/?q=${query}`, {
                headers: {
                    Authorization: "Bearer <Openverse API token>", // Replace <Openverse API token> with your actual token
                },
            });
            const data = await response.json();
            const validImages = data.results.filter((image) => image.url); // Filter out invalid URLs
            console.log("Fetched images:", validImages);
            setImages(validImages.slice(0, 20)); // Get the first 20 valid images
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    // Fetch chat history from the backend
    const fetchHistory = async () => {
        try {
            const token = sessionStorage.getItem("access_token"); // Retrieve token from sessionStorage
            if (!token) {
                throw new Error("No access token found. Please log in again.");
            }

            const response = await fetch("http://127.0.0.1:8000/history", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch history");
            }

            const data = await response.json();
            setChatHistory(data.history.map((entry) => ({ id: entry.id, text: entry.text })));
        } catch (error) {
            console.error("Error fetching history:", error);
            alert(error.message); // Show an alert to the user
        }
    };

    // Post a new search query to the backend
    const postHistory = async (query) => {
        try {
            const token = sessionStorage.getItem("access_token"); // Retrieve token from sessionStorage
            if (!token) {
                alert("Session expired. Redirecting to login.");
                window.location.href = "/login"; // Replace with your login route
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: query }),
            });

            if (!response.ok) {
                throw new Error("Failed to save history");
            }

            // Refresh the history after posting
            fetchHistory();
        } catch (error) {
            console.error("Error saving history:", error);
            alert(error.message); // Show an alert to the user
        }
    };

    // Delete a specific history entry
    const deleteHistory = async (id) => {
        try {
            const token = sessionStorage.getItem("access_token"); // Retrieve token from sessionStorage
            if (!token) {
                alert("Session expired. Redirecting to login.");
                window.location.href = "/login"; // Replace with your login route
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/history/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete history");
            }

            // Refresh the history after deletion
            fetchHistory();
        } catch (error) {
            console.error("Error deleting history:", error);
            alert(error.message); // Show an alert to the user
        }
    };

    // Handle search button click
    const handleSearch = () => {
        if (searchQuery.trim() === "") return;

        // Update the keyword and fetch images
        setKeyword(searchQuery);
        fetchImages(searchQuery);

        // Post the search query to the backend
        postHistory(searchQuery);

        // Clear the search input
        setSearchQuery("");
    };

    // Fetch history on component mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch images whenever the keyword changes
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
                    <h1 className="text-center my-4">Image Gallery</h1>
                    <Row className="mb-4">
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