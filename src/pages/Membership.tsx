import { memo, useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Modal, Form } from "react-bootstrap";
import { TrainingPlan } from "../types/main.ts";
import { URL_API } from "../constants.ts";
import {useUserStore} from "../stores/useUserStore.tsx";
import CookieManager from "../utils/cookieManager.ts";

export const Membership = memo(() => {
    const [memberships, setMemberships] = useState<TrainingPlan[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // For Create Modal
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const {isAdmin} = useUserStore();
    const email = CookieManager.getItem('email');
    const [newPlan, setNewPlan] = useState<TrainingPlan>({
        id: 0,
        name: "",
        type: '',
        duration: 0,
        description: "",
        price: 0,
    });
    const idBothPlan = CookieManager.getItem(`membershipBoth_${email}`);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedBuyPlan, setSelectedBuyPlan] = useState<TrainingPlan | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`${URL_API}/api/memberships`, {
                method: "GET",
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                },
            });

            if (res.ok) {
                const bodyJson = (await res.json()) as TrainingPlan[];
                setMemberships(bodyJson);
            }
        })();
    }, []);

    const handleBuyClick = (plan: TrainingPlan) => {
        setSelectedBuyPlan(plan);
        setShowBuyModal(true); // Show the Buy Confirmation Modal
    };

    const validatePlan = (plan: TrainingPlan) => {
        if (plan.name.length > 30) {
            alert("Name cannot be more than 30 characters.");
            return false;
        }
        if (plan.description.length > 100) {
            alert("Description cannot be more than 100 characters.");
            return false;
        }
        if (plan.price > 10000) {
            alert("Price cannot be more than 10,000.");
            return false;
        }
        if (plan.price < 0 ) {
            alert("The price can't be less than 0");
            return false;
        }
        if (plan.duration < 0) {
            alert("Invalid duration");
            return false;
        }
        if (plan.duration > (365 * 3)) {
            alert("Invalid duration");
            return false;
        }
        return true;
    };

    const handleEditClick = (plan: TrainingPlan) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPlan(null);
    };

    const handleSaveChanges = async () => {
        if (selectedPlan && validatePlan(selectedPlan)) {
            const res = await fetch(`${URL_API}/api/memberships/${selectedPlan.id}`,{
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify(selectedPlan)
            })

            if (res.ok) {
                setMemberships((prev) =>
                    prev.map((e) => (e.id === selectedPlan.id ? selectedPlan : e))
                );
            } else {
                alert(`ErrorEditStatus: ${res.status}`);
            }
        }
        handleCloseModal();
    };

    const handleDeleteClick = (plan: TrainingPlan) => {
        setSelectedPlan(plan);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedPlan) {
            const res = await fetch(`${URL_API}/api/memberships/${selectedPlan.id}`, {
                method: "DELETE",
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                },
            });

            if (res.ok) {
                setMemberships((prev) => prev.filter((e) => e.id !== selectedPlan.id));
            } else {
                alert(`ErrorDeleteStatus: ${res.status}`);
            }
        }
        setShowDeleteModal(false);
        setSelectedPlan(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setSelectedPlan(null);
    };

    const handleCreateClick = () => {
        setShowCreateModal(true); // Show Create Modal
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewPlan({
            id: 0,
            name: "",
            type: '',
            duration: 0,
            description: "",
            price: 0,
        });
    };

    const handleSaveNewPlan = async () => {
        if (validatePlan(newPlan)) {
            const res = await fetch(`${URL_API}/api/memberships`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify(newPlan)
            })

            if (res.ok) {
                setMemberships((prev) => [...prev, { ...newPlan, id: Date.now() }]);
                handleCloseCreateModal();
            } else {
                alert(`ErrorCreateStatus: ${res.status}`);
            }
        }
    };

    const handleConfirmBuy = async () => {
        if (!email) {
            alert('You must be logged in to make purchases');
        }

        if (selectedBuyPlan && email) {

            const res = await fetch(`${URL_API}/api/process-payment`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "69420",
                },
                body: JSON.stringify({
                    email: email,
                    membershipId: selectedBuyPlan.id
                })
            })

            if (res.ok) {
                CookieManager.setItem(`membershipBoth_${email}`, `${selectedBuyPlan.id}`);
                setShowBuyModal(false);
            } else {
                if (res.status === 409) {
                    alert(`You can own only one membership`);
                } else {
                    alert(`ErrorCreateStatus: ${res.status}`);
                }

            }
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center text-light mb-4">Membership</h1>
            {
                isAdmin &&
                <div className="text-center mb-4">
                    <Button variant="success" onClick={handleCreateClick}>
                    Create New Membership Plan
                    </Button>
                </div>
            }
            <Row>
                {memberships.map((plan) => (
                    <Col key={plan.id} md={4} sm={6} className="mb-4">
                        <Card className="text-light bg-dark border-success h-100 rounded d-flex flex-column">
                            <Card.Body className={'d-flex flex-column'}>
                                <Card.Title className="text-success">{plan.name}</Card.Title>
                                <Card.Text>{plan.description}</Card.Text>
                                <Container>
                                    <Row>
                                        <Col>
                                            <h4 className="mt-3">{plan.price}</h4>
                                        </Col>
                                        {isAdmin &&
                                            <Col className={"containerButtons"}>
                                                <Button
                                                    variant="success"
                                                    className="mx-2"
                                                    onClick={() => handleEditClick(plan)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="mx-2"
                                                    onClick={() => handleDeleteClick(plan)}
                                                >
                                                    Delete
                                                </Button>
                                            </Col>
                                        }
                                    </Row>
                                </Container>
                                {+(idBothPlan || -1) === plan.id ? <p className={'text-center mt-auto'}>
                                    Owned
                                </p> : <Button variant="success" className="w-100 mt-auto" onClick={() => {
                                    handleBuyClick(plan);
                                }}>
                                    Buy
                                </Button>}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Edit Modal */}
            {selectedPlan && (
                <Modal show={showModal} centered onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Membership Plan</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formPlanName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedPlan.name}
                                    onChange={(e) =>
                                        setSelectedPlan({
                                            ...selectedPlan,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={selectedPlan.description}
                                    onChange={(e) =>
                                        setSelectedPlan({
                                            ...selectedPlan,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanDuration">
                                <Form.Label>Duration (in days)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={selectedPlan.duration}
                                    onChange={(e) =>
                                        setSelectedPlan({
                                            ...selectedPlan,
                                            duration: +e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanPrice">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={selectedPlan.price}
                                    onChange={(e) =>
                                        setSelectedPlan({
                                            ...selectedPlan,
                                            price: +e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="success" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {selectedPlan && (
                <Modal show={showDeleteModal} centered onHide={handleDeleteCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Membership Plan</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete the membership plan "{selectedPlan.name}"?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleDeleteCancel}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Buy Confirmation Modal */}
            {selectedBuyPlan && (
                <Modal show={showBuyModal} centered onHide={() => setShowBuyModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Purchase</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to buy the membership plan "{selectedBuyPlan.name}" for {selectedBuyPlan.price}?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleConfirmBuy}>
                            Confirm Purchase
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Create Membership Plan Modal */}
            {showCreateModal && (
                <Modal show={showCreateModal} centered onHide={handleCloseCreateModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Membership Plan</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formPlanName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPlan.name}
                                    onChange={(e) =>
                                        setNewPlan({
                                            ...newPlan,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={newPlan.description}
                                    onChange={(e) =>
                                        setNewPlan({
                                            ...newPlan,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanDuration">
                                <Form.Label>Duration (in days)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newPlan.duration}
                                    onChange={(e) =>
                                        setNewPlan({
                                            ...newPlan,
                                            duration: +e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>

                            <Form.Group controlId="formPlanPrice">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newPlan.price}
                                    onChange={(e) =>
                                        setNewPlan({
                                            ...newPlan,
                                            price: +e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal}>
                            Close
                        </Button>
                        <Button variant="success" onClick={handleSaveNewPlan}>
                            Create Plan
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
});
