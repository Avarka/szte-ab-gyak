/*
    =========================================
    ========== Inicializáló script ==========
    =========================================

    Ez a script felelős az adatbázis és a táblák létrehozásáért.
    Az adatok feltöltése már nem itt fog törénni.
*/

CREATE DATABASE IF NOT EXISTS `szamlazas`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_hungarian_ci;

USE `szamlazas`;

CREATE TABLE IF NOT EXISTS `users`
    (
        `email` VARCHAR(200) NOT NULL PRIMARY KEY,
        `password` VARCHAR(100) NOT NULL,
        `name` VARCHAR(50) NOT NULL,
        `isOnline` BOOLEAN,
        `taxNumber` DECIMAL(10) NOT NULL,
        `lastLogin` TIMESTAMP
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `customers`
    (
        `taxNumber` DECIMAL(10) NOT NULL PRIMARY KEY,
        `name` VARCHAR(50) NOT NULL,
        `address` VARCHAR(200) NOT NULL
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `units`
    (
        `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `text` VARCHAR(20) NOT NULL
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `itemTypes`
    (
        `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `text` VARCHAR(20) NOT NULL
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `invoiceTypes`
    (
        `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `text` VARCHAR(20) NOT NULL
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `invoices`
    (
        `number` CHAR(30) NOT NULL,
        `type` INT NOT NULL,
        `date` DATE NOT NULL,
        `deadline` DATE NOT NULL,
        `sum` DOUBLE NOT NULL DEFAULT 0,
        `customerTaxNumber` DECIMAL(10) NOT NULL,
        `issuer` VARCHAR(200) NOT NULL,
        `issuedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`number`, `type`),
        FOREIGN KEY (`customerTaxNumber`) REFERENCES `customers`(`taxNumber`) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (`issuer`) REFERENCES `users`(`email`) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (`type`) REFERENCES `invoiceTypes`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `items`
    (
        `id` INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `type` INT NOT NULL,
        `name` VARCHAR(200) NOT NULL,
        `unit` INT NOT NULL,
        `price` INT NOT NULL,
        FOREIGN KEY (`type`) REFERENCES `itemTypes`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (`unit`) REFERENCES `units`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `invoiceItems`
    (
        `order` INT NOT NULL,
        `itemId` INT NOT NULL,
        `invoiceNumber` CHAR(30) NOT NULL,
        `invoiceType` INT NOT NULL,
        `amount` INT NOT NULL,
        PRIMARY KEY (`order`, `invoiceNumber`, `invoiceType`),
        FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (`invoiceNumber`, `invoiceType`) REFERENCES `invoices`(`number`, `type`) ON UPDATE CASCADE ON DELETE CASCADE
    )
    CHARSET=utf8mb4
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB;

/*
Csak a minta miatt van itt, ez még nem helyes.

CREATE TABLE IF NOT EXISTS `felhasznalok`
    (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `felhasznalonev` VARCHAR(255) NOT NULL,
        `jelszo` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `vezeteknev` VARCHAR(255) NOT NULL,
        `keresztnev` VARCHAR(255) NOT NULL,
        `telefonszam` VARCHAR(255) NOT NULL,
        `szamlazasi_cim` VARCHAR(255) NOT NULL,
        `szallitasi_cim` VARCHAR(255) NOT NULL,
        `regisztracio_datuma` DATETIME NOT NULL,
        `utolso_belepes` DATETIME NOT NULL,
        `aktivacios_kod` VARCHAR(255) NOT NULL,
        `aktivalva` TINYINT(1) NOT NULL DEFAULT '0',
        PRIMARY KEY (`id`),
        UNIQUE INDEX `felhasznalonev` (`felhasznalonev`),
        UNIQUE INDEX `email` (`email`)
    )
    COLLATE='utf8mb4_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;
*/
