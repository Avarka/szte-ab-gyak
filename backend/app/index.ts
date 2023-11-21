import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import { RowDataPacket } from 'mysql2';

dotenv.config();
const dataBase = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT as string),
    charset: 'utf8mb4_hungarian_ci',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

const app: Express = express();
const port = process.env.PORT;


app.get('/debug/:table', (req: Request, res: Response) => {
    const table = req.params.table;
    dataBase.execute(`SELECT * FROM ${table}`, (err, result) => {
        if (err) {
            res.send(err);
        }
        else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify(result));
        }
    });
});


app.post('/register', (req: Request, res: Response) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const taxNumber = req.body.taxNumber;

    dataBase.execute(`INSERT INTO users (email, password, name, taxNumber) VALUES (?, ?, ?, ?)`, 
        [email, password, name, taxNumber], (err, result) => {
        if (err) {
            res.send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.post('/login', (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    dataBase.execute(`SELECT * FROM users WHERE email = ? AND password = ?`, 
        [email, password], (err, result) => {
        if (err) {
            res.send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get('/getInvoices', (req: Request, res: Response) => {
    
    dataBase.execute(`SELECT * FROM invoices`, (err, result) => {
        if (err) {
            res.send(err);
        }
        else {
            res.send(result);
        }
    });
});


app.listen(port, () => {
    console.log(`[backend]: Server is running at http://localhost:${port}`);
    console.log(`[database]: Database is running at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} [${process.env.DB_USER}]`);
});



