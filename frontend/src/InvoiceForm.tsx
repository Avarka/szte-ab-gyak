import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, FormControl, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';
import InvoiceItems from './InoviceItems';

interface InvoiceFormProps {
    invoice: any;
    onClose: () => void;
    onSubmit: () => void;
    showToast: (m: string) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = (props) => {
    const [invoiceNumber, setInvoiceNumber] = useState(
        props.invoice ?
            props.invoice.number :
            new Date().toISOString().split('T')[0].replace(/-/g, '/') + "-" + "1".padStart(19, "0"));
    const [invoiceType, setInvoiceType] = useState(props.invoice?.type || 1);
    const [invoiceTypes, setInvoiceTypes] = useState<any[]>([]);
    const [date, setDate] = useState(
        props.invoice
            ? new Date(props.invoice.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [deadline, setDeadline] = useState(
        props.invoice
            ? new Date(props.invoice.deadline).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [customerTaxNumber, setCustomerTaxNumber] = useState(props.invoice?.customerTaxNumber || '');
    const [customerInfo, setCustomerInfo] = useState<any>(undefined);

    useEffect(() => {
        // Fetch invoice types when the component mounts
        const fetchInvoiceTypes = async () => {
            try {
                const response = await axios.get('/getInvoiceTypes');
                setInvoiceTypes(response.data);
            } catch (error) {
                props.showToast('Hiba történt a számlatípusok lekérdezése során!');
                console.error('Error fetching invoice types:', error);
            }
        };

        if (customerTaxNumber.length === 10) {
            fetchCustomerInfo(customerTaxNumber);
        }

        fetchInvoiceTypes();
    }, []);

    const fetchCustomerInfo = async (taxNumber: string) => {
        try {
            const response = await axios.get(`/getCustomer/${taxNumber}`);
            setCustomerInfo(response.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setCustomerInfo(null);
                props.showToast('Nem található ilyen adószámú vevő!');
                return;
            }
            props.showToast('Hiba történt a vevő lekérdezése során!');
            console.error('Error fetching customer info:', error);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await axios.post('/addInvoice', {
                invNumber: invoiceNumber,
                invType: invoiceType,
                invoiceDate: date,
                deadlineDate: deadline,
                customerTaxNumber
            });

            props.onSubmit();
            props.showToast('Számla létrehozva!');
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                props.showToast('Ez a számlaszám már foglalt!');
                return;
            }
            props.showToast('Hiba történt a számla létrehozása során!');
            console.error('Error creating invoice:', error);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="invoiceNumber">
                    <Form.Label>Számlaszám</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>
                            {invoiceNumber.slice(0, Math.max(invoiceNumber.lastIndexOf('0') + 1, 11))}
                        </InputGroup.Text>
                        <FormControl
                            placeholder="Számlaszám"
                            value={invoiceNumber.slice(Math.max(invoiceNumber.lastIndexOf('0') + 1, 11))}
                            disabled={props.invoice !== undefined}
                            onChange={(e) => {
                                if (e.target.value.length > 19) return;
                                if (e.target.value.length === 0) {
                                    setInvoiceNumber(invoiceNumber.slice(0, 11) + "1".padStart(19, "0"));
                                    return;
                                }
                                if (!(e.target.value.match(/^-?\d+$/))) return;
                                if (e.target.value.includes("0")) return;
                                setInvoiceNumber(invoiceNumber.slice(0, 11) + e.target.value.padStart(19, "0"))
                            }}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3" controlId="invoiceType">
                    <Form.Label>Számlatípus</Form.Label>
                    <InputGroup>
                        <Form.Control
                            as="select"
                            value={invoiceType}
                            disabled={props.invoice !== undefined}
                            onChange={(e) => setInvoiceType(parseInt(e.target.value))}
                        >
                            {invoiceTypes.map((type) => (
                                <option key={type.id} value={type.id} onClick={() => setInvoiceType(type.id)}>
                                    {type.text}
                                </option>
                            ))}
                        </Form.Control>
                    </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="date">
                    <Form.Label>Dátum</Form.Label>
                    <InputGroup className="mb-3">
                        <FormControl
                            type="date"
                            value={date}
                            disabled={props.invoice !== undefined}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3" controlId="deadline">
                    <Form.Label>Teljesítési határidő</Form.Label>
                    <InputGroup className="mb-3">
                        <FormControl
                            type="date"
                            placeholder="Teljesítési határidő"
                            value={deadline}
                            disabled={props.invoice !== undefined}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3" controlId="customerTaxNumber">
                    <Form.Label>Vevő adószáma</Form.Label>
                    <InputGroup className="mb-3">
                        <FormControl
                            placeholder="Vevő adószáma"
                            value={customerTaxNumber}
                            disabled={props.invoice !== undefined}
                            onChange={(e) => {
                                setCustomerTaxNumber(e.target.value);
                                setCustomerInfo(undefined);
                                if (e.target.value.length === 10) {
                                    fetchCustomerInfo(e.target.value);
                                }
                            }}
                        />
                        <InputGroup.Text>
                            <Button
                                variant="outline-secondary"
                                onClick={() => fetchCustomerInfo(customerTaxNumber)}
                                disabled={props.invoice !== undefined}
                            >
                                Vevő információinak lekérése
                            </Button>
                        </InputGroup.Text>
                    </InputGroup>
                </Form.Group>

                {customerInfo && (
                    <div>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Customer Name"
                                value={customerInfo.name}
                                disabled
                            />
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Customer Address"
                                value={customerInfo.address}
                                disabled
                            />
                        </InputGroup>
                    </div>
                )}

                {!props.invoice && (
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={invoiceNumber.length !== 30 || invoiceType === 0 || date === "" || deadline === "" || customerTaxNumber.length !== 10 || customerTaxNumber.match(/^-?\d+$/) === null}
                    >
                        Számla létrehozása
                    </Button>
                )}
                {' '}<Button variant="secondary" onClick={props.onClose}>
                    Vissza
                </Button>
            </Form>
            {props.invoice && (
                <InvoiceItems invoiceNumber={invoiceNumber} invoiceType={invoiceType} showToast={props.showToast} />
            )}
        </>
    );
};

export default InvoiceForm;
