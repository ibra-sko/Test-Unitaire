-- =====================================================================
-- Migration v001 — Création de la base et de la table des inscrits
-- Application "Test Unitaire" (formulaire d'inscription React)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ynov_ci
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ynov_ci;

-- Table des inscrits (champs du composant Registration)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom            VARCHAR(100)  NOT NULL,
  prenom         VARCHAR(100)  NOT NULL,
  email          VARCHAR(255)  NOT NULL,
  date_naissance DATE          NOT NULL,
  ville          VARCHAR(100)  NOT NULL,
  code_postal    CHAR(5)       NOT NULL,
  cree_le        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
