import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Register from './Register';
import Login from './Login';

const Auth = (props: {onLogin: (b: Boolean) => void, showToast: (m: string) => void}) => {
    const [isRegister, setIsRegister] = useState(false);

    const handleToggle = () => {
        setIsRegister(!isRegister);
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs={6}>
                    {isRegister ? <Register toggle={() => handleToggle()} showToast={props.showToast} /> : <Login onLogin={props.onLogin} showToast={props.showToast} />}
                    <Form.Text className="text-muted mt-3">
                        {isRegister ? 'Van már fiókod?' : "Nincs még fiókod?"}{' '}
                        <Button variant="link" onClick={handleToggle}>
                            {isRegister ? 'Bejelentkezés' : 'Regisztráció'}
                        </Button>
                    </Form.Text>
                </Col>
            </Row>
        </Container>
    );
};

export default Auth;
