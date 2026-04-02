# Task Manager Application

A full-stack, aesthetically pleasing Task Manager evaluating backend API design and modern frontend development. 
Built using **Node.js, Express, SQLite, React, Vite, and Tailwind CSS**.

## Project Architecture

### Backend (`/backend`)
- Developed using **Node.js** and **Express**.
- Provides a centralized RESTful API covering users and tasks.
- **SQLite Database** (`sqlite3` / `sqlite`) storing schema and relationships compactly without external database engine dependencies.
- Employs strict request payload and parameter validation sequentially checking for missing/unknown fields using **Zod**.
- **Security & Authorization**: Uses `bcrypt` (12 salt rounds) and `jsonwebtoken` for 8-hour expiry tokens. Middlewares securely lock CRUD actions dependent on user/admin role boundaries.
- **Error Handling**: A centralized express fallback explicitly conforms validation errors into a standard schema structure: `{ error: string, fields?: Record<string, string> }`.

### Frontend (`/frontend`)
- Developed as an SPA using **React.js** (scaffolded with Vite).
- Replaces generic default palettes with premium customized **Tailwind CSS** tokens emphasizing spacing, depth shadows, micro-interactions, and vibrant accents.
- Utilizes the **Context API** globally restricting prop-drilling overhead. Custom hooks (`useAuth`) distribute context intelligently.
- Real-time client forms capture validation error structures returned by the backend 422 codes, mapping them securely back inline over the corresponding inputs gracefully.

---

## Getting Started

You will need two separate terminal windows to run the stack. However, the system might already be running it for you locally!

### 1. Start the Backend API
```bash
cd backend
npm install
node src/index.js
```
*The backend API initializes on `http://localhost:3001`.*

### 2. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*The React Client initializes on `http://localhost:3000` or `http://localhost:5173/` depending on local port caching.*

---

## Evaluation Test Credentials

I've already fully seeded two test accounts corresponding to the requested role-based-access bounds for you test directly on the web application:

### Test Account 1: Admin User
Admins have completely unimpeded global control over ALL tasks created in the system, and can view/delete tasks they've never generated themselves.
- **Email:** `admin@taskmanager.com`
- **Password:** `AdminPass123!`

### Test Account 2: Standard User
Users can only modify/interact with Tasks they've formally created or been overtly allocated into.
- **Email:** `user@taskmanager.com`
- **Password:** `UserPass123!`

*Alternatively, register directly through the application's Signup flow to evaluate the password validation criteria (1 cap, 1 num, 8 lengths)!*
