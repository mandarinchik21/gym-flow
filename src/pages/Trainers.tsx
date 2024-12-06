import { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { URL_API } from "../constants.ts";
import './styles.css';
import { Trainer } from "../types/main.ts";
import {useUserStore} from "../stores/useUserStore.tsx";

export const Trainers = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { isAdmin } = useUserStore();
    const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTrainerId, setDeleteTrainerId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const reloadData = async () => {
        const trainersRes = await fetch(`${URL_API}/api/trainers`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        });

        if (trainersRes.ok) {
            const parsedDataTrainers = await trainersRes.json() as Trainer[];
            setTrainers(parsedDataTrainers);
        } else {
            alert(`Error: Trainers-${trainersRes.status}`);
        }
    };

    const handleShowModal = (trainer: Trainer | null) => {
        setCurrentTrainer(trainer);
        setErrors({});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentTrainer(null);
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!currentTrainer?.name?.trim()) newErrors.name = "Name is required.";
        if (!currentTrainer?.surname?.trim()) newErrors.surname = "Surname is required.";
        if (!currentTrainer?.specialization?.trim()) newErrors.specialization = "Specialization is required.";
        if (currentTrainer?.experience == null || currentTrainer.experience < 0) {
            newErrors.experience = "Experience cannot be negative.";
        }
        if (currentTrainer?.experience == null || currentTrainer.experience > 100) {
            newErrors.experience = "Cannot have over 100 years of experience.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (currentTrainer && validateForm()) {
            const method = currentTrainer.id ? "PUT" : "POST";
            const url = currentTrainer.id
                ? `${URL_API}/api/trainers/${currentTrainer.id}`
                : `${URL_API}/api/trainers`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420", },
                body: JSON.stringify(currentTrainer),
            });

            if (res.ok) {
                reloadData();
                handleCloseModal();
            } else {
                alert("Error saving trainer");
            }
        }
    };

    const handleDelete = (id: number) => {
        setDeleteTrainerId(id);
        setShowDeleteModal(true);
    };

    useEffect(() => {
        reloadData();
    }, []);

    return (
        <div className={'containerTable'}>
            <h1 className={'mb-4'}>Trainers</h1>
            {isAdmin && <Button variant="success" className={'mb-4'} onClick={() => handleShowModal(null)}>
                Add Trainer
            </Button>}
            <Table striped bordered hover variant="dark" >
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    {isAdmin && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {trainers.map((trainer) => (
                    <tr key={trainer.id}>
                        <td>{trainer.name}</td>
                        <td>{trainer.surname}</td>
                        <td>{trainer.specialization}</td>
                        <td>{trainer.experience}</td>
                        {isAdmin && <td>
                            <Button
                                variant="warning"
                                onClick={() => handleShowModal(trainer)}
                            >
                                Edit
                            </Button>{" "}
                            <Button
                                variant="danger"
                                onClick={() => handleDelete(trainer.id)}
                            >
                                Delete
                            </Button>
                        </td>}
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showModal} centered onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTrainer ? "Edit Trainer" : "Add Trainer"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="trainerName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentTrainer?.name || ""}
                                isInvalid={!!errors.name}
                                onChange={(e) =>
                                    setCurrentTrainer((prev) => ({
                                        ...prev!,
                                        name: e.target.value,
                                    }))
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="trainerSurname">
                            <Form.Label>Surname</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentTrainer?.surname || ""}
                                isInvalid={!!errors.surname}
                                onChange={(e) =>
                                    setCurrentTrainer((prev) => ({
                                        ...prev!,
                                        surname: e.target.value,
                                    }))
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.surname}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="trainerSpecialization">
                            <Form.Label>Specialization</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentTrainer?.specialization || ""}
                                isInvalid={!!errors.specialization}
                                onChange={(e) =>
                                    setCurrentTrainer((prev) => ({
                                        ...prev!,
                                        specialization: e.target.value,
                                    }))
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.specialization}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="trainerExperience">
                            <Form.Label>Experience</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentTrainer?.experience || ""}
                                isInvalid={!!errors.experience}
                                onChange={(e) =>
                                    setCurrentTrainer((prev) => ({
                                        ...prev!,
                                        experience: parseInt(e.target.value, 10),
                                    }))
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.experience}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="success" onClick={handleSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} centered onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this trainer? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (deleteTrainerId) {
                                const res = await fetch(`${URL_API}/api/trainers/${deleteTrainerId}`, {
                                    method: "DELETE",
                                    headers: {
                                        "ngrok-skip-browser-warning": "69420",
                                    }
                                });

                                if (res.ok) {
                                    reloadData();
                                    setShowDeleteModal(false);
                                } else {
                                    alert("Error deleting trainer");
                                }
                            }
                        }}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};