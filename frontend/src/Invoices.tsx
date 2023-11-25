
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import InvoiceForm from './InvoiceForm';

const Invoices = (porps: { showToast: (m: string) => void }) => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [showInvoiceForm, setShowInvoiceForm] = useState<boolean>(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(undefined);

    const fetchInvoices = async () => {
        try {
            const response = await axios.get('/getInvoices');
            setInvoices(response.data);
        } catch (error) {
            porps.showToast('Hiba történt a számlák lekérdezése során!');
            console.error('Error fetching invoices:', error);
        }
    };

    useEffect(() => {


        fetchInvoices();
    }, []);

    const handleAddInvoice = () => {
        setSelectedInvoice(undefined);
        setShowInvoiceForm(true);
    };

    const handleEditInvoice = (invoice: any) => {
        setSelectedInvoice(invoice);
        setShowInvoiceForm(true);
    };

    const handleDeleteInvoice = async (invoiceNumber: string, type: number) => {
        try {
            await axios.delete(`/deleteInvoice/${invoiceNumber.replace(/\//g, ".")}/${type}`);
            fetchInvoices();
            porps.showToast('Számla törölve!');
        } catch (error) {
            porps.showToast('Hiba történt a számla törlése során!');
            console.error('Error deleting invoice:', error);
        }
    };

    const handleInvoiceFormClose = async () => {
        try {
            const response = await axios.get('/getInvoices');
            setInvoices(response.data);
            setShowInvoiceForm(false);
        } catch (error) {
            porps.showToast('Hiba történt a számlák lekérdezése során!');
            console.error('Error fetching invoices:', error);
        }
    };

    const handleInvoiceFormSubmit = async () => {
        try {
            const response = await axios.get('/getInvoices');
            setInvoices(response.data);
            setShowInvoiceForm(false);
        } catch (error) {
            porps.showToast('Hiba történt a számlák lekérdezése során!');
            console.error('Error fetching invoices:', error);
        }

    };

    return (
        <div>
            <h1>Számlák</h1>
            {showInvoiceForm ? (
                <InvoiceForm
                    invoice={selectedInvoice}
                    onClose={handleInvoiceFormClose}
                    onSubmit={handleInvoiceFormSubmit}
                    showToast={porps.showToast}
                />
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Számlaszám</th>
                            <th>Típus</th>
                            <th>Vevő</th>
                            <th>Összeg</th>
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={6}>
                                <div className="text-center">
                                    <Button variant="primary" onClick={handleAddInvoice}>
                                        Számla létrehozása
                                    </Button>
                                </div>
                            </td>
                        </tr>
                        {invoices.map((invoice, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{invoice.number}</td>
                                <td>{invoice.text}</td>
                                <td>{invoice.name}</td>
                                <td>{invoice.sum}</td>
                                <td>
                                    <Button variant="info" onClick={() => handleEditInvoice(invoice)}>
                                        Módosítás
                                    </Button>{' '}
                                    {invoice.type === 1 && (
                                        <Button variant="success" onClick={async () => {
                                            const modInv = invoice;
                                            modInv.type = 3;
                                            console.log(modInv);
                                            try {
                                                await axios.post('/addInvoice/copy', {
                                                    invNumber: modInv.number,
                                                    invType: modInv.type,
                                                    invoiceDate: modInv.date.split('T')[0],
                                                    deadlineDate: modInv.deadline.split('T')[0],
                                                    customerTaxNumber: modInv.taxNumber
                                                });

                                                handleAddInvoice();
                                                porps.showToast('Számla létrehozva!');
                                                setSelectedInvoice(modInv);
                                                setShowInvoiceForm(true);
                                            } catch (error: any) {
                                                if (error.response && error.response.status === 409) {
                                                    porps.showToast('Ez a számlaszám már foglalt!');
                                                    return;
                                                }
                                                porps.showToast('Hiba történt a számla létrehozása során!');
                                                console.error('Error creating invoice:', error);
                                            }

                                        }}>
                                            Megrendelés kiadása
                                        </Button>
                                    )}
                                    {' '}<Button variant="danger" onClick={() => handleDeleteInvoice(invoice.number, invoice.type)}>
                                        Törlés
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

export default Invoices;