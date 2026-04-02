# Task Manager Application - Frontend UI

This is the React client for the Task Manager Application, bootstrapped with Vite and heavily stylized with modern Tailwind CSS variables.

## Getting Started

To launch the development server and test the UI:

```bash
npm install
npm run dev
```

*The UI binds context to `http://localhost:3000` assuming the backend REST API runs on `http://localhost:3001`.*

## Test Evaluation Credentials
I have explicitly seeded two pre-configured test accounts possessing varying RBAC tiers down to your SQLite engine. You can log into these accounts natively through the UI to test authorization limits natively vs admin control schemas. 

**Admin Role Account:**
- **Email:** `admin@taskmanager.com`
- **Password:** `AdminPass123!`

**Standard User Account:**
- **Email:** `user@taskmanager.com`
- **Password:** `UserPass123!`

*Alternatively, register directly through the application's Signup flow to evaluate the password validation criteria (1 cap, 1 num, 8 lengths)!*
