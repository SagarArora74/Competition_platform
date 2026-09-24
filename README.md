# Feedants Competition Platform

A full-stack React Native competition platform built for the Feedants Full Stack Development Internship Technical Assignment.

## Tech Stack

- React Native + Expo
- Expo Router + TypeScript
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Axios
- AsyncStorage

## Features

- JWT-based user authentication
- Dynamic competition details from MongoDB
- Competition lifecycle management
- Registration and cancellation
- Participant capacity handling
- Competition submission
- Submission status
- Dynamic countdown timers
- Server-side validation
- MongoDB transactions and unique indexes

## Architecture

React Native → Express REST API → MongoDB

The backend is the source of truth for competition lifecycle, registration, participant capacity, and submission rules.

## Competition Lifecycle

REGISTRATION_OPEN → REGISTRATION_CLOSED → SUBMISSION_OPEN → JUDGING → COMPLETED

A competition can also be CANCELLED.

The current phase is calculated by the backend using competition dates.

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login

### Competition

- GET /api/competitions/:competitionId

### Registration

- GET /api/competitions/:competitionId/registration-status
- POST /api/competitions/:competitionId/register
- DELETE /api/competitions/:competitionId/register

### Submission

- GET /api/competitions/:competitionId/submission
- POST /api/competitions/:competitionId/submission

## Database

### User

Stores name, email, and hashed password.

### Competition

Stores competition information, capacity, dates, judge details, and rewards.

### Registration

Stores user, competition, and registration status.

A unique (userId, competitionId) index prevents duplicate registrations.

### Submission

Stores user, competition, title, description, video URL, and status.

A unique (userId, competitionId) index prevents duplicate submissions.

## Concurrency & Consistency

Registration uses an atomic participant-count update with a capacity check and MongoDB transaction.

This prevents the participant count from exceeding maxParticipants during concurrent registration requests.

Important business rules are enforced on the backend rather than relying only on frontend state.

## Environment Variables

### Server

Create server/.env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

### Client

Create client/.env:

EXPO_PUBLIC_API_URL=http://localhost:5000/api

For a physical device, replace localhost with the computer's local network IP.

Never commit .env files or secrets to GitHub.

## Setup

### Backend

cd server
npm install
npm run dev

Server: http://localhost:5000

### Frontend

cd client
npm install
npx expo start

## Project Structure

feedants-competition/
├── client/
│   └── src/
│       ├── app/
│       └── services/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
└── README.md

## Technical Decisions

- Backend validates competition lifecycle before registration or submission.
- MongoDB unique indexes enforce registration and submission uniqueness.
- MongoDB transactions maintain registration/count consistency.
- Atomic updates protect participant capacity during concurrent requests.
- Environment variables keep configuration separate from source code.

## Assumptions

- One registration per user per competition.
- One submission per user per competition.
- Only registered users can submit.
- Registration and submission are available only during their respective lifecycle phases.
- Video submissions are provided as URLs.
- Payment processing and judging are outside the assignment scope.


## Demo Flow

Login → Competition Details → Registration → Submission → View Submission

