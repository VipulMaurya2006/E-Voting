# Campus Ballot — College E-Voting & Polling

A beginner-friendly voting app for a college project. Students register, vote **once** in each election or poll, and see a live tally. An election officer creates and closes ballots.

**Stack:** React (Vite) · Node.js + Express · MongoDB

## What you can do

- Register / log in as a student
- Vote in open elections and opinion polls (one vote per poll, before the officer-set deadline)
- See result bars after voting or when a poll is closed
- Officer desk: create polls, close/reopen them, delete them

Officers cannot vote (they only run the election).

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [MongoDB Community](https://www.mongodb.com/try/download/community) running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Setup

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm start
```

On macOS/Linux use `cp .env.example .env` instead of `copy`.

Default API: http://localhost:5000

If MongoDB is not on your machine, edit `MONGODB_URI` in `backend/.env` to your Atlas connection string.

A default officer account is created automatically:

- Email: `admin@college.edu`
- Password: `admin123`

Optional sample students and polls:

```bash
cd backend
npm run seed
```

Sample students (password `student123`):

- `aisha@college.edu`
- `rohan@college.edu`

### 2. Frontend

Open a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api` to the Express backend.

## Project layout

```
backend/          Express API + Mongoose models
  models/        User, Poll, Vote
  routes/        auth, polls, votes
frontend/         React UI
```

## Demo flow for viva / screenshots

1. Start MongoDB, then backend and frontend.
2. Log in as `admin@college.edu` / `admin123`.
3. Create an election with at least two candidates and set its voting deadline (or run `npm run seed`).
4. Log out, register a student, open the ballot, vote.
5. Try voting again — the API should refuse a second vote.
6. Log in as officer and close the poll.

## Notes for the report

- Passwords are hashed with bcrypt.
- Login uses JWT stored in the browser.
- Duplicate votes are blocked with a unique `{ poll, voter }` index in MongoDB.
- This is a **teaching demo**, not a production election system (no voter ID verification, no audit trail UI, JWT in localStorage).
