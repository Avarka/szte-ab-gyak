/*
    =========================================
    ==========   Feltöltő script   ==========
    =========================================

    Ez a script felelős az adatok feltöltéséért.
    Az adatbázis és a táblák létrehozását a 1init.sql végzi.
    Összesen legalább 50 rekordot kell létrehozni.
*/

USE `szamlazas`;

/* === USERS === */

/* === CUSTOMERS === */

/* === UNITS === */

INSERT INTO `unit` (`text`) VALUES
    ('db'),
    ('kg'),
    ('l'),
    ('m'),
    ('m2'),
    ('m3'),
    ('óra');

/* --- ÖSSZESEN 7 DARAB --- */

/* === ITEM TYPES === */

INSERT INTO `itemType` (`text`) VALUES
    ('anyag'),
    ('szolgáltatás');

/* --- ÖSSZESEN 2 DARAB --- */

/* === INVOICE TYPES === */

INSERT INTO `invoiceType` (`text`) VALUES
    ('árajnálat'),
    ('díjbekérő'),
    ('igazoló');

/* --- ÖSSZESEN 3 DARAB --- */

/* === INVOICES === */

/* === ITEMS === */

/* === INVOICE ITEMS === */