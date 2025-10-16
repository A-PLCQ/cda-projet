# CDA projet 🌐 APLCQ Portfolio API


# Frontend : React (Vite)

---

# backend

Backend Node.js / Express du **site portfolio a-plcq.com**  
Développé dans le cadre du **projet CDA (Concepteur Développeur d’Applications)**.

---

## 🚀 Présentation

Cette API alimente le **site vitrine et portfolio professionnel** d’Alex PLCQ.  
Elle permet de gérer dynamiquement les projets via un back-office (en cours de développement) et expose des routes publiques pour le front React.

Elle est hébergée sur un **serveur o2switch**, connectée à une base MySQL et sécurisée en HTTPS avec **Let’s Encrypt**.

---

## 🧩 Stack technique

| Composant | Technologie |
|------------|--------------|
| **Langage** | JavaScript (ES Modules) |
| **Framework** | Express.js |
| **Base de données** | MySQL (hébergée sur o2switch) |
| **ORM / Driver** | mysql2 |
| **Sécurité** | CORS, dotenv, JWT (auth à venir) |
| **Upload fichiers** | Multer |
| **Validation** | Zod |
| **Serveur** | Passenger Node.js (cPanel o2switch) |
| **Version Node** | 22.x |
| **Certificat SSL** | Let’s Encrypt (https://api.a-plcq.com) |

---

## 📁 Arborescence du backend

backend/
├── app/
│ ├── config/
│ ├── controllers/
│ ├── helpers/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ └── services/
├── uploads/
├── package.json
└── server.js

---

# API Portfolio A-PLCQ

API REST pour le portfolio (React front + backoffice).  
Stack: **Node.js / Express / MySQL**. Auth **JWT + Refresh Token**. Upload via **Multer**.

- Base URL (prod): `https://api.a-plcq.com`
- Health: `GET /api/health`
- Doc live: `https://api.a-plcq.com/docs`

---

## Sommaire

- [Environnement & démarrage](#environnement--démarrage)
- [Sécurité & Auth](#sécurité--auth)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Projects](#projects)
  - [Categories](#categories)
  - [Media](#media)
  - [Links](#links)
- [Modèles & règles](#modèles--règles)
- [Erreurs](#erreurs)
- [CORS](#cors)
- [Exemples React (Axios)](#exemples-react-axios)
- [Postman](#postman)

---

## Environnement & démarrage

Variables (.env) – en prod chez o2switch, le fichier est `/home/<user>/.private/aplcq.env` :

```ini
NODE_ENV=production
PORT=8888

DB_HOST=localhost
DB_PORT=3306
DB_USER=plau8848_A-plcq
DB_PASSWORD=***************
DB_NAME=plau8848_aplcq_portfolio

JWT_ACCESS_SECRET=***************
JWT_REFRESH_SECRET=***************
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

UPLOAD_DIR=/home/plau8848/apps/portfolio-api/uploads
BASE_URL=https://api.a-plcq.com

# CORS pour le front
CORS_ORIGINS=https://a-plcq.com,https://www.a-plcq.com,http://localhost:5173


🧑‍💻 Auteur
Augustin PLCQ

Projet réalisé dans le cadre de la certification Concepteur Développeur d’Applications (CDA).

📄 Licence
Projet à usage pédagogique et professionnel – © 2025 Alex PLCQ

