# 🎬 Netflix Polyglot Persistence Architecture

A mini data-intensive application demonstrating **Polyglot Persistence** in a Netflix-like streaming platform. This project utilizes three different databases to fulfill distinct operational requirements based on data access patterns and storage models.

---

## 🏛️ System Architecture & Data Distribution

Rather than forcing all application data into a single database, this architecture delegates responsibilities to three distinct technologies:

```
                  ┌────────────────────────────────────────┐
                  │          Next.js Frontend              │
                  │   (Movie Player & Admin Dashboard)     │
                  └───────────────────┬────────────────────┘
                                      │ REST API
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Spring Boot Backend           │
                  └─────────┬─────────┬──────────┬─────────┘
                            │         │          │
         ┌──────────────────┘         │          └──────────────────┐
         ▼                            ▼                             ▼
┌──────────────────┐        ┌──────────────────┐          ┌──────────────────┐
│    PostgreSQL    │        │     MongoDB      │          │      Redis       │
│  (Relational)    │        │  (Document-based)│          │   (Key-Value)    │
└──────────────────┘        └──────────────────┘          └──────────────────┘
```

### 1. PostgreSQL (Relational DB / OLTP)
* **Role:** Stores core structured metadata for movies (ID, title, genre, release year, video stream URLs).
* **Rationale:** Relational integrity and ACID compliance are essential for core platform entities and transactional safety.

### 2. MongoDB (Document Store)
* **Role:** Stores rich, semi-structured metadata including detailed movie synopses, dynamic cast arrays, and user comments with ratings.
* **Rationale:** Document stores allow flexible schemas and embedded nested arrays, enabling seamless updates to unstructured content without complex relational joins.

### 3. Redis (In-Memory Key-Value / Cache)
* **Role:** Stores real-time user playback progress (`progress:userId:movieId -> seconds`).
* **Rationale:** In-memory key-value operations provide ultra-low latency reads/writes, reducing heavy database load during continuous video playback state updates.

---

## 🚀 Prerequisites & Quick Start

### 1. Requirements
* Docker & Docker Compose
* Java 21 (JDK)
* Node.js (v18+)

### 2. Running Database Infrastructure
To launch PostgreSQL, MongoDB, and Redis containers:

```bash
docker compose up -d
```

Verify that all containers are healthy:
```bash
docker compose ps
```

### 3. Running Backend (Spring Boot)
Open a new terminal in the `backend/` directory:

```bash
cd backend
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 4. Running Frontend (Next.js)
Open another terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🛠️ Admin Control Panel & Features

1. **User View (`/`):** Stream HTML5 videos, read plot summaries and cast details from MongoDB, and automatically cache video watch progress to Redis upon pausing/seeking.
2. **Admin Panel (`/admin`):**
   * **PostgreSQL Tab:** View, insert, and delete movies.
   * **MongoDB Tab:** Insert and view rich movie documents and comments.
   * **Redis Tab:** View and manually overwrite playback progress keys in cache.
   * **Seed Data Button:** Instantly seed or reset dummy data across all three databases with a single click (`/api/seed`).

---

## 🌐 API Endpoints Summary

| Method | Endpoint | Database | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/postgres/movies` | PostgreSQL | Fetch all movies |
| `POST` | `/api/postgres/movies` | PostgreSQL | Create a new movie |
| `DELETE` | `/api/postgres/movies/{id}` | PostgreSQL | Delete a movie |
| `GET` | `/api/mongo/details` | MongoDB | Fetch all movie detail documents |
| `POST` | `/api/mongo/details` | MongoDB | Create a new detail document |
| `GET` | `/api/redis/progress/{userId}/{movieId}` | Redis | Fetch cached playback progress |
| `POST` | `/api/redis/progress` | Redis | Update watch progress key |
| `POST` | `/api/seed` | All DBs | Re-populate dummy data |
