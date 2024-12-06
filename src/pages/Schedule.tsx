import { FormEvent, useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { URL_API } from "../constants";
import { Schedule, ScheduleTrainer, Trainer } from "../types/main";
import {useUserStore} from "../stores/useUserStore.tsx";

export const SchedulePage = () => {
    const [scheduleData, setScheduleData] = useState<ScheduleTrainer[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { isAdmin } = useUserStore();
    const [modalType, setModalType] = useState<'create' | 'update' | 'delete' | null>(null);
    const [currentItem, setCurrentItem] = useState<ScheduleTrainer | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTrainer, setSelectedTrainer] = useState<number | "">("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const reloadData = async () => {
        const scheduleRes = await fetch(`${URL_API}/api/schedule-templates`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        });
        const trainersRes = await fetch(`${URL_API}/api/trainers`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        });

        if (trainersRes.ok && scheduleRes.ok) {
            const parsedDataSchedule = await scheduleRes.json() as Schedule[];
            const parsedDataTrainers = await trainersRes.json() as Trainer[];
            setTrainers(parsedDataTrainers);

            const dataConcat = parsedDataSchedule
                .map((e) => {
                    const trainer = parsedDataTrainers.find((el) => el.id === e.trainerId);

                    if (!trainer) return null;

                    return {
                        time: e.time,
                        id: e.id,
                        trainerId: e.trainerId,
                        name: trainer.name,
                        dayOfWeek: e.dayOfWeek,
                        experience: trainer.experience,
                        specialization: trainer.specialization,
                        surname: trainer.surname,
                    } as ScheduleTrainer;
                })
                .filter((e): e is ScheduleTrainer => e !== null);

            setScheduleData(dataConcat);
        } else {
            alert(`Error: Schedule-${scheduleRes.status}, Trainers-${trainersRes.status}`);
        }
    }

    useEffect(() => {
        reloadData();
    }, []);

    const isTrainerAvailable = (): boolean => {
        if (!selectedTrainer || !selectedTime || !selectedDay) return false;

        const selectedTimeNumber = parseInt(selectedTime.replace(":", ""), 10);

        return !scheduleData.some((item) => {
            if (item.trainerId !== selectedTrainer || item.dayOfWeek !== selectedDay) {
                return false;
            }

            const itemTimeNumber = parseInt(item.time.replace(":", ""), 10);

            // Check for overlap: training lasts 1 hour
            return Math.abs(itemTimeNumber - selectedTimeNumber) < 100;
        });
    };

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleModalShow = (type: 'create' | 'update' | 'delete', item: ScheduleTrainer | null = null) => {
        setModalType(type);
        setCurrentItem(item);

        // If editing or deleting, prefill data
        if (type === 'update' && item) {
            setSelectedTrainer(item.trainerId);
            setSelectedTime(item.time.replace(":00", ""));
            setSelectedDay(item.dayOfWeek);
        } else if (type === 'create') {
            setSelectedTrainer("");
            setSelectedTime("");
        } else if (type === 'delete') {
            setSelectedTrainer("");
            setSelectedTime("");
            setSelectedDay(null);
        }

        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setModalType(null);
        setCurrentItem(null);
        setSelectedTrainer("");
        setSelectedTime("");
        setValidationError(null);
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isTrainerAvailable() && modalType !== 'delete') {
            setValidationError("Trainer is already booked for the selected time.");
            return;
        }

        (async () => {
            if (modalType === 'delete') {
                if (!currentItem ) {
                    return;
                }
                const res = await fetch(`${URL_API}/api/schedule-templates/${currentItem.id}`, {
                    method: "DELETE",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                    }
                });

                if (res.ok) {
                    setScheduleData((prev)=> prev.filter((e)=> e.id !== currentItem.id));
                }
            } else if (modalType === 'create') {
                const bodyObj = {
                    trainerId: selectedTrainer,
                    time: `${selectedTime}:00`,
                    dayOfWeek: selectedDay
                };

                const res = await fetch(`${URL_API}/api/schedule-templates`, {
                    method: "POST",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyObj)
                });

                if (res.ok) {
                    await reloadData();
                } else {
                    alert(`Failed to create schedule: ${res.status}`);
                }
            } else if (modalType === 'update') {
                if (!currentItem ) {
                    return;
                }
                const bodyObj = {
                    trainerId: selectedTrainer,
                    time: `${selectedTime}:00`,
                    dayOfWeek: selectedDay
                };

                const res = await fetch(`${URL_API}/api/schedule-templates/${currentItem.id}`, {
                    method: "PUT",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyObj)
                });

                if (res.ok) {
                    await reloadData();
                } else {
                    alert(`Failed to update schedule: ${res.status}`);
                }
            }
        })();

        handleModalClose();
    };

    return (
        <Container fluid>
            <Row>
                {daysOfWeek.map((day) => (
                    <Col key={day} className="p-2">
                        <h5 className="text-center text-white">{day}</h5>
                        <div className="d-flex flex-column gap-2">
                            {scheduleData
                                .filter((item) => item.dayOfWeek === day)
                                .map((item) => (
                                    <Card key={item.id} className="bg-dark text-white">
                                        <Card.Body>
                                            <Card.Title className="fs-6">{item.specialization}</Card.Title>
                                            <Card.Text className="mb-1">
                                                <strong>{item.name} {item.surname}</strong>
                                            </Card.Text>
                                            <Card.Text className="mb-1">
                                                {item.time}
                                            </Card.Text>
                                            {isAdmin && <div className="mt-2 d-flex gap-2">
                                                <Button size="sm" variant="warning"
                                                        onClick={() => handleModalShow('update', item)}>Edit</Button>
                                                <Button size="sm" variant="danger"
                                                        onClick={() => handleModalShow('delete', item)}>Delete</Button>
                                            </div>}
                                        </Card.Body>
                                    </Card>
                                ))}
                            <Button size="sm" variant="success" onClick={() => {
                                setSelectedDay(day);
                                handleModalShow('create');
                            }}>Add Session</Button>
                        </div>
                    </Col>
                ))}
            </Row>
            <Modal show={showModal} centered onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType === 'create' ? 'Add Session' : modalType === 'update' ? 'Edit Schedule' : 'Delete Schedule'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Body>
                        {validationError && <div className="alert alert-danger">{validationError}</div>}
                        {modalType === 'delete' ? (
                            <p>Are you sure you want to delete this schedule?</p>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Trainer</Form.Label>
                                    <Form.Select
                                        value={selectedTrainer}
                                        onChange={(e) => setSelectedTrainer(Number(e.target.value))}
                                        required
                                    >
                                        <option value="">-- Select Trainer --</option>
                                        {trainers.map((trainer) => (
                                            <option key={trainer.id} value={trainer.id}>
                                                {trainer.name} {trainer.surname}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                {modalType === 'update' &&<Form.Group className="mb-3">
                                    <Form.Label>Select Day</Form.Label>
                                    <Form.Select
                                        value={selectedDay || ""}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Day --</option>
                                        {daysOfWeek.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                        <Button type="submit" variant="success">{modalType === 'delete' ? 'Delete' : 'Save'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};
