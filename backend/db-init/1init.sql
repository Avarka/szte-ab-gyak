/*
    =========================================
    ========== Inicializáló script ==========
    =========================================

    Ez a script felelős az adatbázis és a táblák létrehozásáért.
    Az adatok feltöltése már nem itt fog törénni.
*/

CREATE DATABASE IF NOT EXISTS `szamlazas`
    CHARACTER SET utf8
    COLLATE utf8_hungarian_ci;

USE `szamlazas`;

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
    COLLATE='utf8_hungarian_ci'
    ENGINE=InnoDB
    AUTO_INCREMENT=1;
*/
