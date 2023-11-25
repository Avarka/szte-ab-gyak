import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Dropdown, Container } from 'react-bootstrap';
import axios from 'axios';

const InvoiceItems = ({ invoiceNumber, invoiceType, showToast }: any) => {
    const [items, setItems] = useState<any[]>([]);
    const [itemList, setItemList] = useState<any[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>('');
    const [quantity, setQuantity] = useState(0);
    const [fullPrice, setFullPrice] = useState(0);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`/getInvoiceItems/${invoiceNumber.replace(/\//g, ".")}/${invoiceType}`);

            setItems(response.data);
            if (response.data.length > 0) {
                const r = await axios.get(`/getPrice/${invoiceNumber.replace(/\//g, ".")}/${invoiceType}`);
                setFullPrice(r.data.sum);
            }

        } catch (error) {
            showToast('Hiba történt a tétel lekérdezése során!');
            console.error(error);
        }
    };

    useEffect(() => {
        const fI = async () => {
            try {
                const resp = await axios.get('/getItems', { withCredentials: true });
                setItemList(resp.data);
            } catch (error) {
                showToast('Hiba történt a tételek lekérdezése során!');
                console.error(error);
            }
        }
        fI();
        fetchItems();
    }, [invoiceNumber]);

    const openPopup = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setQuantity(0);
        setSelectedItem('');
        setShowPopup(false);
    };

    const addItem = async () => {
        try {
            const existingItem = items.find(item => item.itemId === selectedItem.id);
            const order = existingItem ? existingItem.order : items.length + 1;
            const amount = existingItem ? existingItem.amount + quantity : quantity;

            await axios.post('/addItemToInvoice', {
                invNumber: invoiceNumber,
                invType: invoiceType,
                itemId: selectedItem.id,
                quantity: amount,
                order: order
            });

            fetchItems();
            showToast(existingItem ? 'Tétel módosítva!' : 'Tétel hozzáadva!');
            closePopup();
        } catch (error) {
            showToast('Hiba történt a tétel hozzáadása során!');
            console.error(error);
        }
    };

    return (
        <Container>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Megnevezés</th>
                        <th>Ár</th>
                        <th>Mértékegység</th>
                        <th>Mennyiség</th>
                        <th>Teljes ár</th>
                        <th>Műveletek</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.order}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.text}</td>
                            <td>{item.amount}</td>
                            <td>{item.price * item.amount}</td>
                            <td>
                                <Button
                                    variant="success"
                                    onClick={async () => {
                                        await axios.post('/addItemToInvoice', {
                                            invNumber: invoiceNumber,
                                            invType: invoiceType,
                                            itemId: item.itemId,
                                            quantity: item.amount + 1,
                                            order: item.order
                                        }, { withCredentials: true });
                                        fetchItems();
                                    }}
                                >+</Button>{' '}
                                <Button
                                    variant="danger"
                                    onClick={async () => {
                                        await axios.post('/addItemToInvoice', {
                                            invNumber: invoiceNumber,
                                            invType: invoiceType,
                                            itemId: item.itemId,
                                            quantity: item.amount - 1,
                                            order: item.order
                                        }, { withCredentials: true });
                                        fetchItems();
                                    }}
                                >-</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ fontWeight: "bold" }}>
                        <td colSpan={4} style={{ textAlign: "right" }}>Összesítés</td>
                        <td>{items.reduce((total, item) => total + item.amount, 0)}</td>
                        <td>{fullPrice}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </Table>

            <Button variant="primary" onClick={openPopup}>
                Tétel hozzáadás
            </Button>

            <Modal show={showPopup} onHide={closePopup}>
                <Modal.Header closeButton>
                    <Modal.Title>Tétel hozzáadása</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                {selectedItem ? selectedItem.name : 'Válassz tételt'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {itemList.map((item) => (
                                    <Dropdown.Item
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        {item.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Form.Control
                            type="number"
                            placeholder="Mennyiség"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />

                        <Button variant="primary" onClick={addItem}>
                            Hozzáadás
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default InvoiceItems;

