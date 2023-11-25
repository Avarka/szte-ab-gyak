import React, { useState } from 'react';
import { Container, Form, Button, Toast } from 'react-bootstrap';
import axios from 'axios';


const Register = (props: { toggle: () => any, showToast: (m: string) => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [taxNumber, setTaxnumber] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password1 !== password2) {
            props.showToast('A két jelszó nem egyezik!');
            return;
        }

        if (taxNumber.length != 10) {
            props.showToast('Az adószám hossza nem megfelelő!');
            return;
        }

        const res = axios.post('/register', {
            name,
            email,
            password1,
            taxNumber
        })
            .then(_res => {
                props.showToast('Sikeres regisztráció!');
            })
            .catch(err => {
                console.log(err);

                if (err.request.status === 409) {
                    props.showToast('Ez az email cím már foglalt!');
                    return;
                } else if (err.request.status !== 200) {
                    props.showToast('Hiba történt a regisztráció során!');
                    return;
                }
            });

        console.log(res);
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                    <Form.Label>Teljes név</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Kiss János"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="email">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="kiss.janos@valami.hu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="taxNumber">
                    <Form.Label>Adószám</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="1234567890"
                        value={taxNumber}
                        onChange={(e) => setTaxnumber(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="password1">
                    <Form.Label>Jelszó</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="*********"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="password2">
                    <Form.Label>Jelszó ismét</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="*********"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Regisztáció
                </Button>
            </Form>
        </Container>
    );
};

export default Register;
