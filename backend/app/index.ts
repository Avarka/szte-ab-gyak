import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql, { RowDataPacket } from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';
import expressSession, { Session, SessionData } from 'express-session';

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}

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

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());
app.use(expressSession({
    secret: "subidubi",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'strict',
    },
    name: 'abSession',
    rolling: true
}));

function isAuthenticated(req: Request, res: Response, next: express.NextFunction) {
    if (req.session.user) {
        next();
    } else {
        next('route');
    }
}

function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

function comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

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
    const password = hashPassword(req.body.password1);
    const email = req.body.email;
    const taxNumber = req.body.taxNumber;

    if (taxNumber.length != 10 && Number.isNaN(taxNumber)) {
        res.status(400)
            .send(JSON.stringify({ error: "Invalid tax number" }));
        return;
    }

    dataBase.execute(`INSERT INTO users (email, password, name, taxNumber) VALUES (?, ?, ?, ?)`,
        [email, password, name, taxNumber], (err, result) => {
            if (!err) {
                res.status(200)
                    .send(result);
            } else if (err.code == "ER_DUP_ENTRY") {
                res.status(409)
                    .send("User already exists");
            } else {
                res.status(500)
                    .send(err);
            }
        });
});

app.post('/login', (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    dataBase.execute(`SELECT * FROM users WHERE email = ?`,
        [email], (err, result: RowDataPacket[]) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                const user = result[0];
                if (!user) {
                    res.sendStatus(404);
                    return;
                }

                if (!comparePassword(password, user.password)) {
                    res.sendStatus(401);
                    return;
                }

                req.session.user = user;
                req.session.regenerate(function (err) {
                    if (err)
                        throw err;

                    req.session.user = user

                    req.session.save(function (err) {
                        if (err) throw err;
                        dataBase.execute("UPDATE `users` SET `lastLogin` = NOW(), `isOnline` = true WHERE `email` = ?", [email], (err, _result) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        res.status(200)
                            .send(user);
                    })
                });
            }
        });
});

app.get('/logout', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("UPDATE `users` SET `isOnline` = false WHERE `email` = ?", [req.session.user!.email], (err, _result) => {
        if (err) {
            console.log(err);
        }
    });
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.sendStatus(200)
    });
});

app.get('/getInvoices', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT * FROM `invoices` " + 
    "INNER JOIN `customers` ON `invoices`.`customerTaxNumber` = `customers`.`taxNumber` " +
    "INNER JOIN `invoiceTypes` ON `invoices`.`type` = `invoiceTypes`.`id` " +
    "ORDER BY `inoices`.`number`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get('/getItems', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT `items`.`id`, `name`, `itemTypes`.`text` AS `itemType`, `units`.`text` AS `unit`, `price` FROM `items` " +
        "INNER JOIN `units` ON `units`.`id` = `items`.`unit` " +
        "INNER JOIN `itemTypes` ON `itemTypes`.`id` = `items`.`type` " +
        "ORDER BY `items`.`id` ASC",
        (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                res.send(result);
            }
        });
});

app.get('/getUnits', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT * FROM `units`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get('/getItemTypes', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT * FROM `itemTypes`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get('/getCustomer/:taxNumber', isAuthenticated, (req: Request, res: Response) => {
    const taxNumber = req.params.taxNumber;
    dataBase.execute("SELECT * FROM `customers` WHERE `taxNumber` = ?", [taxNumber], (err, result: RowDataPacket[]) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            if (result.length == 0) {
                res.status(404).send(null);
                return;
            }
            res.send(result[0]);
        }
    });
});

app.get('/getCustomers', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT * FROM `customers` ORDER BY `cutomers`.`name`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.post('/createCustomer', isAuthenticated, (req: Request, res: Response) => {
    const name = req.body.name;
    const taxNumber = req.body.taxNumber;
    const address = req.body.address;

    dataBase.execute("INSERT INTO `customers` (`name`, `taxNumber`, `address`) VALUES (?, ?, ?)",
        [name, taxNumber, address], (err, result) => {
            if (err) {
                if (err.code == "ER_DUP_ENTRY") {
                    res.sendStatus(409);
                    return;
                }
                res.status(500)
                    .send(err);
            }
            else {
                res.sendStatus(200);
            }
        });
});

app.delete('/deleteCustomer/:taxNumber', isAuthenticated, (req: Request, res: Response) => {
    const taxNumber = req.params.taxNumber;

    dataBase.execute("DELETE FROM `customers` WHERE `taxNumber` = ?",
        [taxNumber], (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                res.send(result);
            }
        });
});

app.post('/addItem', isAuthenticated, (req: Request, res: Response) => {
    const type = req.body.type;
    const name = req.body.name;
    const unit = req.body.unit;
    const price = req.body.price;

    dataBase.execute("INSERT INTO `items` (`type`, `name`, `unit`, `price`) VALUES (?, ?, ?, ?)",
        [type, name, unit, price], (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
                return;
            }
            else {
                const newItemId = (result as any).insertId;
                dataBase.execute("SELECT * FROM `items` WHERE `id` = ?", [newItemId], (err, newItemResult: RowDataPacket[]) => {
                    if (err) {
                        res.status(500)
                            .send(err);
                    }
                    else {
                        const newItem = newItemResult[0];
                        res.send(newItem);
                    }
                });
            }
        });
});

app.delete('/deleteItem/:itemId', isAuthenticated, (req: Request, res: Response) => {
    const itemId = req.params.itemId;

    dataBase.execute("DELETE FROM `items` WHERE `id` = ?",
        [itemId], (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                res.send(result);
            }
        });
});

app.get('/getPrice/:invoiceNumber/:invType', isAuthenticated, (req: Request, res: Response) => {
    const invoiceNumber = req.params.invoiceNumber.replace(/\./g, "/");
    const invType = req.params.invType;
    let price = 0;

    dataBase.execute("SELECT SUM(`items`.`price` * `invoiceItems`.`amount`) AS `price` FROM `invoiceItems`" + 
        "INNER JOIN `items` ON `items`.`id` = `invoiceItems`.`itemId`" +
        "WHERE `invoiceNumber` = ? AND `invoiceType` = ?",
        [invoiceNumber, invType], (err, result: RowDataPacket[]) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                price = result[0].price;
                //Ezt nem kéne egyben csinálni, mert fölöslegsen update-elünk, ha 
                //csak lekérdezni akartunk.
                dataBase.execute("UPDATE `invoices` SET `sum` = ? WHERE `number` = ? AND `type` = ?",
                    [price, invoiceNumber, invType], (err, _result) => {
                        if (err) {
                            res.status(500)
                                .send(err);
                        }
                        else {
                            res.send({sum: price});
                        }
                    });
            }
        });
});

app.delete('/deleteInvoice/:invNumber/:invType', isAuthenticated, (req: Request, res: Response) => {
    const invNumber = req.params.invNumber.replace(/\./g, "/");
    const invType = req.params.invType;

    dataBase.execute("DELETE FROM `invoices` WHERE `number` = ? AND `type` = ?",
        [invNumber, invType], (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                res.send(result);
            }
        });
});

app.post('/addInvoice/:copy?', isAuthenticated, (req: Request, res: Response) => {
    const copy = req.params.copy;
    const invNumber = req.body.invNumber || getNextInvoiceNumber();
    const invType = req.body.invType;
    const invoiceDate = req.body.invoiceDate;
    const deadlineDate = req.body.deadlineDate;
    const customerTaxNumber = req.body.customerTaxNumber;
    const issuer = req.session.user!.email;

    dataBase.execute("INSERT INTO `invoices` (`number`, `type`, `date`, `deadline`, `customerTaxNumber`, `issuer`) VALUES" +
        "(?, ?, ?, ?, ?, ?)",
        [invNumber, invType, invoiceDate, deadlineDate, customerTaxNumber, issuer], (err, result) => {
            if (err) {
                if (err.code == "ER_DUP_ENTRY") {
                    res.sendStatus(409);
                    return;
                }
                res.status(500)
                    .send(err);
            } else {
                if (copy) {
                    dataBase.execute("SELECT * FROM `invoiceItems` WHERE `invoiceNumber` = ? AND `invoiceType` = 1",
                        [invNumber], (err, result: RowDataPacket[]) => {
                            if (err) {
                                res.sendStatus(500);
                                console.log(err);
                            }
                            else {
                                for (const item of result) {
                                    dataBase.execute("INSERT INTO `invoiceItems` (`order`, `itemId`, `invoiceNumber`, `invoiceType`, `amount`) VALUES (?, ?, ?, ?, ?)",
                                        [item.order, item.itemId, invNumber, invType, item.amount], (err, _result) => {
                                            if (err) {
                                                res.sendStatus(500);
                                                console.log(err);
                                            }
                                        });
                                }
                                res.sendStatus(200);
                            }
                        });
                } else {
                    res.sendStatus(200);
                }
            }
        });
});

app.get('/getInvoiceTypes', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT * FROM `invoiceTypes`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.post('/addItemToInvoice', isAuthenticated, (req: Request, res: Response) => {
    const invNumber = req.body.invNumber;
    const invType = req.body.invType;
    const order = req.body.order;
    const itemId = req.body.itemId;
    const quantity = req.body.quantity;

    dataBase.execute("SELECT * FROM `invoiceItems` WHERE `invoiceNumber` = ? AND `invoiceType` = ? AND `itemId` = ?",
        [invNumber, invType, itemId], (err, result: RowDataPacket[]) => {
            if (err) {
                console.log(err);
            }
            else {
                if (result.length > 0) {
                    if (quantity == 0) {
                        dataBase.execute("DELETE FROM `invoiceItems` WHERE `invoiceNumber` = ? AND `invoiceType` = ? AND `itemId` = ?",
                            [invNumber, invType, itemId], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500)
                                        .send(err);
                                }
                                else {
                                    res.send(result);
                                }
                            });
                        return;
                    }
                    dataBase.execute("UPDATE `invoiceItems` SET `amount` = ? WHERE `invoiceNumber` = ? AND `invoiceType` = ? AND `itemId` = ?",
                        [quantity, invNumber, invType, itemId], (err, result) => {
                            if (err) {
                                res.status(500)
                                    .send(err);
                            }
                            else {
                                res.send(result);
                            }
                        });
                } else {
                    dataBase.execute("INSERT INTO `invoiceItems` (`order`, `itemId`, `invoiceNumber`, `invoiceType`, `amount`) VALUES (?, ?, ?, ?, ?)",
                        [order, itemId, invNumber, invType, quantity], (err, result) => {
                            if (err) {
                                res.status(500)
                                    .send(err);
                            }
                            else {
                                res.send(result);
                            }
                            return;
                        });
                }
            }
        });
});

app.get('/getInvoiceItems/:invoiceNumber/:invoiceType', isAuthenticated, (req: Request, res: Response) => {
    const invNumber = req.params.invoiceNumber.replace(/\./g, "/");
    const invType = req.params.invoiceType;

    dataBase.execute("SELECT `invoiceItems`.`order`, `invoiceItems`.`itemId`, `items`.`name`, `invoiceItems`.`amount`, `units`.`text`, `items`.`price` FROM `invoiceItems` " +
        "INNER JOIN `items` ON `items`.`id` = `invoiceItems`.`itemId` " +
        "INNER JOIN `units` ON `items`.`unit` = `units`.`id` " +
        "WHERE `invoiceItems`.`invoiceNumber` = ? AND `invoiceItems`.`invoiceType` = ? " +
        "ORDER BY `invoiceItems`.`order` ASC",
        [invNumber, invType], (err, result) => {
            if (err) {
                res.status(500)
                    .send(err);
            }
            else {
                res.send(result);
            }
        });
});

app.get('/f1', isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT YEAR(`invoices`.`date`) AS 'Év', MONTH(`invoices`.`date`) AS 'Hónap', SUM(`invoices`.`sum`) AS 'Összeg' FROM `invoices` " + 
    "WHERE `invoices`.`type` = 3 " + 
    "GROUP BY `Év`, `Hónap`", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get("/f2", isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT `items`.`name` AS 'Megnevezés', COUNT(`invoiceItems`.`itemId`) AS 'Darabszám' FROM `invoiceItems` " +
	"INNER JOIN `items` ON `invoiceItems`.`itemId` = `items`.`id` " +
	"GROUP BY `invoiceItems`.`itemId` " +
    "ORDER BY `Darabszám` DESC " + 
    "LIMIT 10", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get("/f3", isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT `items`.`name` AS 'Megnevezés', SUM(`invoiceItems`.`amount`) AS 'Darabszám' FROM `invoiceItems` " +
	"INNER JOIN `items` ON `invoiceItems`.`itemId` = `items`.`id` " +
	"GROUP BY `invoiceItems`.`itemId` " +
    "ORDER BY `Darabszám` DESC " +
    "LIMIT 10", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
        }
        else {
            res.send(result);
        }
    });
});

app.get("/f4", isAuthenticated, (req: Request, res: Response) => {
    dataBase.execute("SELECT YEAR(`invoices`.`date`) AS 'Év', COUNT(`invoices`.`number`) AS 'Darabszám', SUM(`invoices`.`sum`) AS 'Bevétel' FROM `invoices` " +
	"WHERE `invoices`.`type` = 1 AND" +
            "`invoices`.`number` IN ( " +
				"SELECT `invoices`.`number` FROM `invoices` " +
                "WHERE `invoices`.`type` = 3 " +
            ") " +
    "GROUP BY YEAR(`invoices`.`date`)", (err, result) => {
        if (err) {
            res.status(500)
                .send(err);
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

function getNextInvoiceNumber() {
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

    return dataBase.execute(`SELECT \`number\` FROM \`invoices\` WHERE number LIKE '${dateString}%'`,
        (err, result: RowDataPacket[]) => {
            if (err) {
                console.log(err);
            }
            else {
                if (result.length == 0) {
                    return dateString + "-0000000000000000001";
                }
                else {
                    const lastNumber = result[result.length - 1].number;
                    const lastNumberInt = parseInt(lastNumber.slice(11));
                    const nextNumber = lastNumberInt + 1;
                    return dateString + "-" + nextNumber.toString().padStart(19, "0");
                }
            }
        });
}

function getNextOrderNumber(invoiceNumber: string) {
    let order = 0;
    dataBase.execute("SELECT MAX(`order`) AS `order` FROM `invoiceItems` WHERE `invoiceNumber` = ?",
        [invoiceNumber], (err, result: RowDataPacket[]) => {
            if (err) {
                console.log(err);
            }
            else {
                order = result[0].order + 1;
            }
        });
    return order;
}

