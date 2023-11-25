import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, Toast } from 'react-bootstrap';
import Cookies from 'js-cookie';
import Invoices from './Invoices';
import Auth from './Auth';
import Items from './Items';
import F from './F';
import axios from 'axios';
import Customers from './Customers';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<Boolean>(Cookies.get('abSession') !== undefined);
    const [selectedMenu, setSelectedMenu] = useState<string>('invoices');
    const [toastMessage, setToastMessage] = useState<string>('');

    const handleLogout = async () => {
        try {
            await axios.get('/logout');
            Cookies.remove('abSession');
            setIsAuthenticated(false);
        }
        catch (err) {
            showToast('Hiba történt a kijelentkezés során!');
            console.log(err);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
    };

    if (!isAuthenticated) {
        return (
            <>
                <Auth onLogin={(b: Boolean) => setIsAuthenticated(b)} showToast={showToast} />
                <Toast
                    show={toastMessage !== ''}
                    onClose={() => setToastMessage('')}
                    style={{
                        position: 'fixed',
                        top: "20px",
                        right: "20px",
                    }}
                    delay={3000}
                    autohide
                >
                    <Toast.Header>Rendszerüzenet</Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </>

        );
    }

    return (
        <Container>
            <Navbar bg="light" expand="lg">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link onClick={() => setSelectedMenu('invoices')}>Számlák</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('items')}>Tételek</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('customers')}>Vevők</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('what')}>Kimutatás</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('top10')}>Top 10</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('top10v2')}>Top 10 - Fejlesztett</Nav.Link>
                        <Nav.Link onClick={() => setSelectedMenu('whatv2')}>Kimutatás - Fejlesztett</Nav.Link>
                        <Nav.Link onClick={handleLogout}>Kijelentkezés</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            {selectedMenu === 'invoices' && <Invoices showToast={showToast} />}
            {selectedMenu === 'items' && <Items showToast={showToast} />}
            {selectedMenu === 'customers' && <Customers showToast={showToast} />}
            {selectedMenu === 'what' && <F numberFromProp={1} showToast={showToast} />}
            {selectedMenu === 'top10' && <F numberFromProp={2} showToast={showToast} />}
            {selectedMenu === 'top10v2' && <F numberFromProp={3} showToast={showToast} />}
            {selectedMenu === 'whatv2' && <F numberFromProp={4} showToast={showToast} />}
            <Toast
                show={toastMessage !== ''}
                onClose={() => setToastMessage('')}
                style={{
                    position: 'fixed',
                    top: "20px",
                    right: "20px",
                }}
                delay={3000}
                autohide
            >
                <Toast.Header>Rendszerüzenet</Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </Container>
    );
}

export default App;