import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Table } from 'react-bootstrap';

interface Customer {
    name: string;
    taxNumber: string;
    address: string;
}

const Customers = (props: { showToast: (m: string) => void }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer>({
        name: '',
        taxNumber: '',
        address: '',
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('/getCustomers', { withCredentials: true });
            setCustomers(response.data);
        } catch (error) {
            props.showToast('Hiba történt a vevők lekérdezése során!');
            console.error('Error fetching customers:', error);
        }
    };

    const createCustomer = async () => {
        try {
            await axios.post('/createCustomer', newCustomer, { withCredentials: true });
            fetchCustomers();
            props.showToast('Vevő létrehozva!');
            setShowModal(false);
        } catch (error: any) {
            if (error.response.status === 409) {
                props.showToast('Ez az adószám már foglalt!');
            } else {
                props.showToast('Hiba történt a vevő létrehozása során!');
                console.error('Error creating customer:', error);
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewCustomer((prevCustomer) => ({
            ...prevCustomer,
            [name]: value,
        }));
    };

    const deleteCustomer = async (id: any) => {
        try {
            await axios.delete(`/deleteCustomer/${id}`, { withCredentials: true });
            fetchCustomers();
            props.showToast('Vevő törölve!');
        } catch (error) {
            props.showToast('Hiba történt a vevő törlése során!');
            console.error('Error deleting customer:', error);
        }
    }

    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Új vevő hozzáadása</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Név</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newCustomer.name}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formTaxNumber">
                            <Form.Label>Adószám</Form.Label>
                            <Form.Control
                                type="text"
                                name="taxNumber"
                                value={newCustomer.taxNumber}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Cím</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={newCustomer.address}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Mégse
                    </Button>
                    <Button variant="primary" onClick={createCustomer}>
                        Mentés
                    </Button>
                </Modal.Footer>
            </Modal>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Név</th>
                        <th>Adószám</th>
                        <th>Cím</th>
                        <th>Művelet</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={4} className='text-center'>
                            <Button onClick={() => setShowModal(true)} variant="primary">
                                Vevő hozzáadása
                            </Button>
                        </td>
                    </tr>
                    {customers.map((customer, index) => (
                        <tr key={index}>
                            <td>{customer.name}</td>
                            <td>{customer.taxNumber}</td>
                            <td>{customer.address}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCustomer(customer.taxNumber)}
                                >Törlés</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Customers;
