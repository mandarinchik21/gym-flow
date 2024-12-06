import { URL_API } from "../constants.ts";
import { Client, ClientTable, TrainingPlan, User } from "../types/main.ts";
import { useEffect, useState } from "react";
import './styles.css';
import {Table, Button, Spinner} from "react-bootstrap";

export const Clients = () => {
    const [clients, setClients] = useState<ClientTable[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const reloadData = async () => {
        try {
            setLoading(true);
            const [clientsRes, userRes, membershipsRes] = await Promise.all([
                fetch(`${URL_API}/api/clients`, {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                    },
                }),
                fetch(`${URL_API}/api/users`, {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                    },
                }),
                fetch(`${URL_API}/api/memberships`, {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                    },
                }),
            ]);

            if (clientsRes.ok && userRes.ok && membershipsRes.ok) {
                const parsedDataClients = (await clientsRes.json()) as Client[];
                const parsedDataUsers = (await userRes.json()) as User[];
                const parsedDataMemberships = (await membershipsRes.json()) as TrainingPlan[];

                const newData = parsedDataClients
                    .map((e) => {
                        const user = parsedDataUsers.find((el) => el.id === e.userId);
                        const memberships = parsedDataMemberships.find((el) => el.id === e.membershipId);

                        if (!user || !memberships) return null;

                        return {
                            emailUser: user.email,
                            id: e.id,
                            nameUser: user.name,
                            endDate: e.endDate,
                            surnameUser: user.surname,
                            startDate: e.startDate,
                            nameTrainingPlan: memberships.name,
                        } as ClientTable;
                    })
                    .filter((e) => e !== null);

                setClients(newData as ClientTable[]);
            } else {
                alert(`Error: Clients-${clientsRes.status}`);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (clientId: number) => {
        try {
            const response = await fetch(`${URL_API}/api/clients/${clientId}`, {
                method: "DELETE",
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                },
            });

            if (response.ok) {
                setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
                alert("Client deleted successfully.");
            } else {
                alert(`Error deleting client: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("Failed to delete client.");
        }
    };

    useEffect(() => {
        reloadData();
    }, []);

    return (
        <div className={'containerTable'}>
                <h2>Clients</h2>
                {loading ? (
                    <Spinner animation="border" variant="success" />
                ) : (
                    <Table striped bordered hover variant={'dark'}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Email</th>
                            <th>Training Plan</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clients.map((client, index) => (
                            <tr key={client.id}>
                                <td>{index + 1}</td>
                                <td>{client.nameUser}</td>
                                <td>{client.surnameUser}</td>
                                <td>{client.emailUser}</td>
                                <td>{client.nameTrainingPlan}</td>
                                <td>{new Date(client.startDate).toLocaleDateString()}</td>
                                <td>{new Date(client.endDate).toLocaleDateString()}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(client.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
        </div>
    );
};