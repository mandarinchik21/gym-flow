import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Carousel, Card, Button, Modal} from 'react-bootstrap';
import useMediaQuery from "../hooks/useMediaQuery.ts";
import { useEffect, useState} from "react";
import {TrainingPlan} from "../types/main.ts";
import {URL_API} from "../constants.ts";
import CookieManager from "../utils/cookieManager.ts";
import {useUserStore} from "../stores/useUserStore.tsx";
import {useNavigate} from "react-router-dom";
import {carouselItems} from "./mockData.ts";


export const Main = () => {
    const {isSmall} = useMediaQuery();
    const navigate = useNavigate();
    const [memberships, setMemberships] = useState<TrainingPlan[]>([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const {isLoggedIn} = useUserStore();
    const email = CookieManager.getItem('email');
    const idBothPlan = CookieManager.getItem(`membershipBoth_${email}`);
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
                setMemberships(bodyJson.filter((_, i)=> i < 6));
            }
        })();
    }, []);

    const handleBuyClick = (plan: TrainingPlan) => {
        setSelectedBuyPlan(plan);
        setShowBuyModal(true); // Show the Buy Confirmation Modal
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
        <>
            {<Container className="d-flex pb-3 " style={{
                width: '100%'
            }}>
                <Row className="w-100">
                    <Col className="w-100">
                        <Carousel autoCapitalize={'off'}>
                            {carouselItems.map((item, i) => (
                                <Carousel.Item key={i}>
                                    <img
                                        className="d-block w-100 object-fit-cover"
                                        src={item.imgSrc}
                                        alt={item.altText}
                                    />
                                    <Carousel.Caption>
                                        <h3 className="text-start" style={{ fontSize: isSmall ? '14px' : '18px' }}>
                                            {item.title}
                                        </h3>
                                        <p className="text-start" style={{ fontSize: isSmall ? '8px' : '18px' }}>
                                            {item.description}
                                        </p>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>
            </Container>}
            <Container>
                <Row>
                    {memberships.map((plan) => (
                        <Col key={plan.id} md={4} sm={6} className="mb-4">
                            <Card className="text-light bg-dark border-success h-100 rounded d-flex flex-column">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-success">{plan.name}</Card.Title>
                                    <Card.Text>{plan.description}</Card.Text>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <h4 className="mt-3">{plan.price}</h4>
                                            </Col>
                                        </Row>
                                    </Container>
                                    {!isLoggedIn ? (
                                        <Button
                                            variant="success"
                                            className="w-100 mt-2"
                                            onClick={() => {
                                                navigate('/signIn');
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                    ) : (
                                        +(idBothPlan || -1) === plan.id ? (
                                            <p className={'text-center mt-auto'}>
                                                Owned
                                            </p>
                                        ) : (
                                            <Button
                                                variant="success"
                                                className="w-100 mt-2 mt-auto"
                                                onClick={() => {
                                                    handleBuyClick(plan);
                                                }}
                                            >
                                                Buy
                                            </Button>
                                        )
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

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
        </>
    );
};
