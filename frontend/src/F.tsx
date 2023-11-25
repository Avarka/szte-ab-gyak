import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

interface Props {
    numberFromProp: number;
    showToast: (m: string) => void;
}

const FComponent: React.FC<Props> = ({ numberFromProp, showToast }) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/f${numberFromProp}`);
                setData(response.data);
            } catch (error) {
                showToast('Hiba történt a feladat lekérdezése során!');
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [numberFromProp]);

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    {data.length > 0 &&
                        Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        {Object.values(item).map((value: any, index) => (
                            <td key={index}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default FComponent;
