# 📦 Full-Stack Inventory & Order Management System (IMS Pro)

A complete, production-ready, enterprise-grade Inventory and Order Management platform built with a decoupled modern architecture. The system features automated inventory tracking, relational database persistence, dynamic low-stock safety thresholds, and strict input integrity checks.

---

## 🚀 Live Production Links

* **Frontend Deployment (Vercel):** https://inventory-management-system-kanishk-goel-s-projects.vercel.app/
* **Backend API Gateway (Render):** https://ims-backend-o0qi.onrender.com
* **Interactive API Documentation:** https://ims-backend-o0qi.onrender.com/docs
* **Container Image (Docker Hub):** https://hub.docker.com/repository/docker/kanishk55497/ims-backend

---

## 🛠️ The Technology Stack

* **Frontend:** React.js, Bootstrap 5 (Responsive UI), Axios (API Layer)
* **Backend API Engine:** FastAPI (Python 3.11+), Pydantic v2 (Data Validation)
* **Database Tier:** PostgreSQL (Relational Integrity, Managed Instance)
* **Containerization Engine:** Docker & Docker Compose (Environment Isolation)

---

## ✨ Core System Features

* **Summary Dashboard Engine:** High-level analytics rendering total metrics for inventory units, registered user profiles, and active orders placed.
* **Critical Low-Stock Automated Alerts:** A defensive UI sub-grid that automatically flags items dropping strictly below a safety threshold of **5 units**.
* **Relational Order Processing:** Dropdown logic dynamically cross-references active customer records and remaining stocks. 
* **Automated Inventory Reconciliation:** Placing orders instantly reduces the core stock totals. Cancelling an active order automatically reverses the flow, restocking the product balance.
* **Robust Error & Constraint Handling:** Enforces database uniqueness validation across Product SKUs and Customer Emails, serving descriptive errors directly to the client screen.

---

## 🐳 How to Spin Up the Ecosystem Locally

The entire multi-container ecosystem is orchestrated using Docker. Ensure Docker Desktop is active on your computer, then execute the following commands in your root folder:

```bash
# 1. Spin up PostgreSQL, FastAPI backend, and React frontend concurrently
docker compose up --build

# 2. Access the Applications
# -> Frontend Portal:  http://localhost:3000
# -> Swagger Backend:  http://localhost:8000/docs
