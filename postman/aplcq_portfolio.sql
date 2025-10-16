-- ==========
-- Préambule
-- ==========
-- (Optionnel) décommente la ligne suivante si tu veux cibler explicitement ta base :
-- USE `plau8848_aplcq_portfolio`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Facilite le DROP/CREATE en présence de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- =====================
-- Suppression (propre)
-- =====================
DROP TABLE IF EXISTS `refresh_token`;
DROP TABLE IF EXISTS `APPARTIENT_A`;
DROP TABLE IF EXISTS `lien_projet`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `categorie`;
DROP TABLE IF EXISTS `projet`;
DROP TABLE IF EXISTS `utilisateur`;
DROP TABLE IF EXISTS `role`;

SET FOREIGN_KEY_CHECKS = 1;

-- =========
-- Création
-- =========

-- ROLES (NB : `role` est un mot réservé dans certaines versions → on protège avec des backticks)
CREATE TABLE `role` (
  `id_role`       VARCHAR(50)  NOT NULL,
  `nom`           VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UTILISATEURS
CREATE TABLE `utilisateur` (
  `id_utilisateur`   VARCHAR(50)   NOT NULL,
  `email`            VARCHAR(255)  NOT NULL,
  `mot_de_passe_hash`VARCHAR(255)  NOT NULL,
  `nom_affiche`      VARCHAR(120)  NOT NULL,
  `statut`           VARCHAR(10)   NULL,
  `date_creation`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_maj`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_role`          VARCHAR(50)   NOT NULL,
  UNIQUE KEY `uniq_utilisateur_email` (`email`),
  KEY `idx_utilisateur_role` (`id_role`),
  PRIMARY KEY (`id_utilisateur`),
  CONSTRAINT `fk_utilisateur_role`
    FOREIGN KEY (`id_role`) REFERENCES `role`(`id_role`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PROJETS
CREATE TABLE `projet` (
  `id_projet`        VARCHAR(50)   NOT NULL,
  `titre`            VARCHAR(255)  NOT NULL,
  `slug`             VARCHAR(255)  NOT NULL,
  `extrait`          TEXT          NULL,
  `description`      TEXT          NULL,
  `client`           VARCHAR(255)  NULL,
  `date_debut`       DATE          NULL,
  `date_fin`         DATE          NULL,
  `statut`           VARCHAR(50)   NOT NULL,
  `est_mis_en_avant` TINYINT(1)    NOT NULL DEFAULT 0,
  `date_creation`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_maj`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_utilisateur`   VARCHAR(50)   NOT NULL,
  UNIQUE KEY `uniq_projet_slug` (`slug`),
  KEY `idx_projet_utilisateur` (`id_utilisateur`),
  PRIMARY KEY (`id_projet`),
  CONSTRAINT `fk_projet_utilisateur`
    FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur`(`id_utilisateur`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CATEGORIES
CREATE TABLE `categorie` (
  `id_categorie` VARCHAR(50)   NOT NULL,
  `nom`          VARCHAR(255)  NOT NULL,
  `slug`         VARCHAR(255)  NOT NULL,
  `description`  TEXT          NULL,
  UNIQUE KEY `uniq_categorie_slug` (`slug`),
  PRIMARY KEY (`id_categorie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MEDIAS
-- (note : on évite le mot réservé `position` → colonne `position_`)
CREATE TABLE `media` (
  `id_media`      VARCHAR(50)   NOT NULL,
  `chemin`        VARCHAR(255)  NOT NULL,
  `legende`       VARCHAR(255)  NULL,
  `type`          VARCHAR(50)   NOT NULL,
  `position_`     INT           NOT NULL,
  `date_creation` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_projet`     VARCHAR(50)   NOT NULL,
  KEY `idx_media_projet` (`id_projet`),
  KEY `idx_media_projet_pos` (`id_projet`, `position_`),
  PRIMARY KEY (`id_media`),
  CONSTRAINT `fk_media_projet`
    FOREIGN KEY (`id_projet`) REFERENCES `projet`(`id_projet`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LIENS PROJET
CREATE TABLE `lien_projet` (
  `id_lien`    VARCHAR(50)   NOT NULL,
  `libelle`    VARCHAR(255)  NOT NULL,
  `url`        VARCHAR(255)  NOT NULL,
  `type`       VARCHAR(50)   NOT NULL,
  `id_projet`  VARCHAR(50)   NOT NULL,
  KEY `idx_lien_projet` (`id_projet`),
  PRIMARY KEY (`id_lien`),
  CONSTRAINT `fk_lien_projet`
    FOREIGN KEY (`id_projet`) REFERENCES `projet`(`id_projet`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- N:N PROJET <-> CATEGORIE
CREATE TABLE `APPARTIENT_A` (
  `id_projet`     VARCHAR(50) NOT NULL,
  `id_categorie`  VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_projet`, `id_categorie`),
  KEY `idx_appartient_categorie` (`id_categorie`),
  CONSTRAINT `fk_appartient_projet`
    FOREIGN KEY (`id_projet`) REFERENCES `projet`(`id_projet`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_appartient_categorie`
    FOREIGN KEY (`id_categorie`) REFERENCES `categorie`(`id_categorie`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REFRESH TOKENS (lié à `utilisateur`)
CREATE TABLE `refresh_token` (
  `jti`            VARCHAR(50)   NOT NULL,     -- identifiant du token (UUID recommandé)
  `id_utilisateur` VARCHAR(50)   NOT NULL,     -- FK vers utilisateur
  `token_hash`     VARCHAR(255)  NOT NULL,     -- hash du refresh token (bcrypt/argon2)
  `expires_at`     DATETIME      NOT NULL,
  `revoked`        TINYINT(1)    NOT NULL DEFAULT 0,
  `client_type`    VARCHAR(50)   NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at`   DATETIME      NULL,
  `user_agent`     VARCHAR(255)  NULL,
  `ip`             VARCHAR(45)   NULL,
  KEY `idx_rt_user`    (`id_utilisateur`),
  KEY `idx_rt_exp`     (`expires_at`),
  KEY `idx_rt_revoked` (`revoked`),
  PRIMARY KEY (`jti`),
  CONSTRAINT `fk_rt_user`
    FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur`(`id_utilisateur`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (Optionnel) quelques rôles de base
-- INSERT INTO `role` (`id_role`,`nom`) VALUES ('admin','Administrateur'),('editor','Éditeur'),('user','Utilisateur');
