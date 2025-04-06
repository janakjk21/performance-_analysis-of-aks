import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";

const Maindashboard = () => {
    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [keyword, setKeyword] = useState("test"); // Default keyword
    const [chatHistory, setChatHistory] = useState([]); // Chat history state

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(`https://api.openverse.org/v1/images/?q=${keyword}`, {
                    headers: {
                        Authorization: "Bearer <Openverse API token>", // Replace <Openverse API token> with your actual token
                    },
                });
                const data = await response.json();
                console.log("Fetched images:", data.results);
                setImages(data.results.slice(0, 20)); // Get the first 20 images
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchImages();
    }, [keyword]);

    const handleSearch = () => {
        setKeyword(searchQuery);
        setChatHistory((prevHistory) => [...prevHistory, searchQuery]); // Add search query to chat history
    };

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col xs={12} md={3} className="bg-light vh-100 p-3">
                    <h5>Chat History</h5>
                    <ListGroup>
                        {chatHistory.map((query, index) => (
                            <ListGroup.Item key={index}>{query}</ListGroup.Item>
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
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card>
                                    <Card.Img
                                        variant="top"
                                        src={image.url} // Replace `image.url` with the correct property from your API response
                                        alt={image.title || `Image ${index + 1}`}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <Card.Body>
                                        <Card.Text className="text-center">
                                            {image.title || `Image ${index + 1}`}
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
