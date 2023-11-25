import { useEffect, useState } from 'react';
import { Form, Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';

const Items = (porps: {showToast: (m: string) => void}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [newItemData, setNewItemData] = useState({
        name: '',
        price: '',
        quantity: '',
        type: '1',
        unit: '1',
    });
    const [itemTypes, setItemTypes] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        // Fetch items from the server using the getItems endpoint
        axios.get('/getItems', { withCredentials: true })
            .then((response) => setItems(response.data))
            .catch((error) => {
                porps.showToast('Hiba történt a tételek lekérdezése során!');
                console.log(error);
            });

        // Fetch item types from the server using the getItemTypes endpoint
        axios.get('/getItemTypes', { withCredentials: true })
            .then((response) => setItemTypes(response.data))
            .catch((error) => {
                porps.showToast('Hiba történt a tétel típusok lekérdezése során!');
                console.log(error);
            });

        // Fetch units from the server using the getUnits endpoint
        axios.get('/getUnits', { withCredentials: true })
            .then((response) => setUnits(response.data))
            .catch((error) => {
                porps.showToast('Hiba történt az egységek lekérdezése során!');
                console.log(error);
            });
    }, []);

    const handleDelete = async (id: number) => {
        await axios.delete(`/deleteItem/${id}`, { withCredentials: true });
        axios.get('/getItems', { withCredentials: true })
            .then((response) => {
                setItems(response.data);
                porps.showToast('Tétel törölve!');
            })
            .catch((error) => {
                porps.showToast('Hiba történt a tételek lekérdezése során!');
                console.log(error);
            });
    }

    const handleAddItem = () => {
        // Show the modal to add a new item
        setShowModal(true);
    };

    const handleModalClose = () => {
        // Close the modal
        setShowModal(false);
    };

    const handleModalSave = () => {
        axios.post('/addItem', newItemData, { withCredentials: true })
            .then((_response) => {
                // Item saved successfully, update the items list
                axios.get('/getItems', { withCredentials: true })
                    .then((response) => {
                        setItems(response.data);
                        porps.showToast('Tétel hozzáadva!');
                    })
                    .catch((error) => {
                        porps.showToast('Hiba történt a tételek lekérdezése során!');
                        console.log(error)
                    });
            })
            .catch((error) => {
                porps.showToast('Hiba történt a tétel hozzáadása során!');
                console.log(error);
            });
        
        setNewItemData({
            name: '',
            price: '',
            quantity: '',
            type: '1',
            unit: '1',
        });

        setShowModal(false);
    };

    return (
        <div>
            <h1>Tételek</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Név</th>
                        <th>Típus</th>
                        <th>Egység</th>
                        <th>Egységár</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>
                            <Button variant="success" onClick={handleAddItem}>
                                Hozzáadás
                            </Button>
                        </td>
                    </tr>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.itemType}</td>
                            <td>{item.unit}</td>
                            <td>{item.price}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(item.id)}>
                                    Törlés
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formType">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={newItemData.type}
                                onChange={(e) =>
                                    setNewItemData({ ...newItemData, type: e.target.value })
                                }
                            >
                                {itemTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.text}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={newItemData.name}
                                onChange={(e) =>
                                    setNewItemData({ ...newItemData, name: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group controlId="formUnit">
                            <Form.Label>Unit</Form.Label>
                            <Form.Control
                                as="select"
                                value={newItemData.unit}
                                onChange={(e) =>
                                    setNewItemData({ ...newItemData, unit: e.target.value })
                                }
                            >
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.text}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter price"
                                value={newItemData.price}
                                onChange={(e) =>
                                    setNewItemData({ ...newItemData, price: e.target.value })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleModalSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Items;