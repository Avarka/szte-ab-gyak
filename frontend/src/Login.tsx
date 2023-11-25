import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const Login = (props: {onLogin: (b: Boolean) => void, showToast: (m: string) => void}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle form submission logic here

        axios.post('/login', {
            email: email,
            password: password
        }).then(res => {
            console.log(res);
            props.onLogin(true);
            props.showToast('Sikeres bejelentkezés!');
        }).catch(err => {
            if (err.request.status === 404) { 
                props.showToast('Nincs ilyen felhasználó!');
                return;
            } else {
                props.showToast('A megadott jelszó nem helyes!');
            }
            props.showToast('Hiba történt a bejelentkezés során!');
            console.log(err);
        });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email cím</Form.Label>
                <Form.Control type="email" placeholder="Email cím" 
                    onChange={(e) => setEmail(e.target.value)}/>
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
                <Form.Label>Jelszó</Form.Label>
                <Form.Control type="password" placeholder="*******" 
                    onChange={(e) => setPassword(e.target.value)}/>
            </Form.Group>

            <Button variant="primary" type="submit">
                Bejelentkezés
            </Button>
        </Form>
    );
};

export default Login;
