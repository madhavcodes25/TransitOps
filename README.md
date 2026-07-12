# TransitOps

**Smart Transport Operations Platform** — a full-stack fleet management system for tracking vehicles, drivers, trips, maintenance, fuel, and operational costs in real time.

Built for Odoo Hackathon 2026.

---

##  Live Demo

- **App:** https://transitops-production-5c4c.up.railway.app
- **API Docs (Swagger):** https://transitops-production-5c4c.up.railway.app/swagger-ui/index.html

### Demo Credentials
| Email | Password | Role |
|---|---|---|
| `demo.admin@transitops.test` | `DemoPass456!` | Admin |

Or register your own account at `/pages/register.html`.

---

##  Tech Stack

**Backend**
- Java 21, Spring Boot 3.5
- Spring Security + JWT (stateless authentication)
- Spring Data JPA / Hibernate
- PostgreSQL (hosted on [Neon](https://neon.tech))

**Frontend**
- Vanilla HTML/CSS/JS
- Bootstrap 5 (dark theme)
- Chart.js (analytics visualizations)
- Served as static files directly from the Spring Boot backend (same-origin, no CORS needed)

**Deployment**
- Railway (backend + static frontend, single service)
- Neon Postgres (serverless database)

---

##  Features

- **Authentication & RBAC** — JWT-based login/register with five roles: `ADMIN`, `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`. Endpoints are protected with `@PreAuthorize` based on role.
- **Fleet Management** — Register, view, and filter vehicles by type/status; track odometer, capacity, and acquisition cost.
- **Driver Management** — Register and track drivers, license expiry, safety scores, and duty status.
- **Trip Dispatch** — Create trips with live cargo-capacity validation against the selected vehicle; auto-updates vehicle/driver availability.
- **Maintenance Logging** — Log service records per vehicle, mark them complete, and track cost history.
- **Fuel & Expense Tracking** — Log fuel fill-ups and trip-linked expenses (tolls, parking, misc); auto-calculates total operational cost.
- **Analytics Dashboard** — Real-time KPIs (fuel efficiency, fleet utilization, operational cost, vehicle ROI) computed from live data, with revenue and cost charts. CSV export included.

---

##  Project Structure

```
backend/
├── src/main/java/com/transitops/backend/
│   ├── config/           # SecurityConfig (JWT filter chain, CORS, route permissions)
│   ├── controller/        # REST controllers (auth, vehicles, drivers, trips, maintenance, fuel, expenses)
│   ├── dto/auth/           # Request/response DTOs for auth endpoints
│   ├── entity/             # JPA entities (Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense)
│   ├── enums/               # Status/type enums (VehicleStatus, TripStatus, Role, etc.)
│   ├── security/jwt/         # JwtService, JwtAuthenticationFilter
│   └── service/                # Business logic layer
└── src/main/resources/
    ├── application.properties
    └── static/                  # Frontend (served directly by Spring Boot)
        ├── index.html
        ├── css/
        ├── js/
        └── pages/
            ├── login.html
            ├── register.html
            ├── dashboard.html
            ├── vehicles.html
            ├── drivers.html
            ├── trips.html
            ├── maintenance.html
            ├── fuel.html
            ├── reports.html
            └── settings.html
```

---

##  Authentication Flow

1. `POST /api/auth/register` — create an account (name, email, password, role)
2. `POST /api/auth/login` — returns a JWT
3. Frontend stores the JWT in `localStorage` and attaches it as `Authorization: Bearer <token>` on every subsequent request
4. `JwtAuthenticationFilter` validates the token on each request; `SecurityConfig` enforces role-based access per endpoint

Static pages (`/`, `/index.html`, `/css/**`, `/js/**`, `/pages/**`) and `/api/auth/**` are public. Everything else requires a valid token.

---

## 📡 API Overview

| Endpoint | Methods | Roles |
|---|---|---|
| `/api/auth/register`, `/api/auth/login` | POST | Public |
| `/api/vehicles` | GET, POST, PUT, DELETE | ADMIN, FLEET_MANAGER (write); + FINANCIAL_ANALYST (read) |
| `/api/drivers` | GET, POST, PUT, DELETE | ADMIN, FLEET_MANAGER (write); + FINANCIAL_ANALYST (read) |
| `/api/trips` | GET, POST, PUT, DELETE | ADMIN, FLEET_MANAGER, DISPATCHER (write); + FINANCIAL_ANALYST (read) |
| `/api/maintenance` | GET, POST, PUT, DELETE | ADMIN, SAFETY_OFFICER (write); + FLEET_MANAGER, FINANCIAL_ANALYST (read) |
| `/api/fuel` | GET, POST, PUT, DELETE | ADMIN, FLEET_MANAGER (write); + FINANCIAL_ANALYST (read) |
| `/api/expenses` | GET, POST, PUT, DELETE | ADMIN, FINANCIAL_ANALYST (write); + FLEET_MANAGER (read) |

Full interactive docs available via Swagger UI at `/swagger-ui/index.html` once deployed.

---

##  Local Setup

### Prerequisites
- Java 21+
- Maven
- A PostgreSQL database (local or [Neon](https://neon.tech) free tier)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/transitops.git
cd transitops
```

### 2. Configure environment variables
Set the following (either as actual env vars, or in a local `application-local.properties` — do **not** commit real credentials):

```
DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<any-long-random-string>
```

Generate a JWT secret:
```bash
openssl rand -base64 32
```

### 3. Run the backend
```bash
./mvnw spring-boot:run
```
The app (including the frontend, served as static files) will be available at `http://localhost:8080`.

### 4. Open the app
Navigate to `http://localhost:8080` — you'll land on the login page. Register a new account via `/pages/register.html` or use the Swagger UI at `/swagger-ui/index.html` to create one directly.

---

##  Deployment

This project is deployed as a **single Railway service**:

1. **Database:** Neon Postgres — grab the connection string from the Neon dashboard and split it into `DB_URL` (prefixed with `jdbc:`, keeping `?sslmode=require`), `DB_USERNAME`, and `DB_PASSWORD`.
2. **Backend + Frontend:** Both are deployed together on Railway. The frontend lives in `src/main/resources/static/` and is served automatically by Spring Boot — no separate hosting or CORS configuration needed, since everything is same-origin.
3. **Environment variables** (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`) are set in Railway's **Variables** tab.
4. `server.forward-headers-strategy=framework` is set in `application.properties` so Spring correctly recognizes HTTPS behind Railway's proxy (required for Swagger UI and any absolute URL generation to work correctly).

---

##  Testing the API

The fastest way to test endpoints directly is via Swagger UI:

```
https://your-app.up.railway.app/swagger-ui/index.html
```

Expand any endpoint → **Try it out** → fill in the request body → **Execute**.

Example register payload:
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "password123",
  "role": "ADMIN"
}
```

---

##  Roadmap / Known Limitations

- Settings page is currently UI-only (no backend persistence for depot name, currency, or distance unit preferences).
- The "Maint. Linked" column on the Fuel & Expenses page is not yet computed — `Expense` records link to `Trip`, not `MaintenanceLog`, so this figure is not auto-populated.
- No password reset / forgot-password flow yet.
- RBAC permissions on the Settings page's matrix are illustrative; actual enforcement happens via `@PreAuthorize` on the backend, not frontend role-gating.

---

##  Team

JaidityaSinha
madhavcodes35

##  License

MIT
