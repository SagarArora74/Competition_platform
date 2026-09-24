# Feedants Competition Platform

A functional full-stack implementation of the Feedants Competition Details screen for the Full Stack Development Internship technical assignment.

The application uses **React Native (Expo)** for the client, **Node.js + Express.js** for the backend, and **MongoDB + Mongoose** for persistence.

## Features

- User registration and login
- JWT-based authentication
- Dynamic competition details from the backend
- Competition lifecycle based on configured dates
- Registration with remaining-seat tracking
- Duplicate-registration prevention
- Capacity protection for concurrent registrations
- Registration cancellation while registration is open
- Submission of a competition entry
- Video URL validation
- Duplicate-submission prevention
- Persistent registration and submission state
- Submission remains visible after logout/login
- Time-dependent UI states and countdown
- Backend validation for business rules

## Tech Stack

### Frontend
- React Native
- Expo
- Expo Router
- TypeScript
- Axios
- AsyncStorage

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

## Project Structure

```text
feedants-competition/
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │       └── api.ts
│   ├── package.json
│   └── app.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── openRegistration.js
│   │   └── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## How the Application Works

The main flow is:

```text
Create Account
      ↓
Login
      ↓
Competition Details
      ↓
Register for Competition
      ↓
Submit Entry
      ↓
Submission Saved in MongoDB
      ↓
Logout
      ↓
Login Again
      ↓
Previously Submitted Entry Is Loaded
```

Competition information is fetched from the backend rather than being hardcoded into the screen.

## Backend Setup

### Requirements

- Node.js
- npm
- MongoDB database (local MongoDB or MongoDB Atlas)

### 1. Open the server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create:

```text
server/.env
```

Add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/feedants
JWT_SECRET=replace_with_a_long_random_secret
```

Do not commit the real `.env` file to GitHub.

### 4. Start the backend

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

## React Native Setup

### 1. Open the client directory

From the project root:

```bash
cd client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Create:

```text
client/.env
```

For an emulator or browser running on the same machine:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For a physical mobile device, `localhost` refers to the phone itself. Use the computer's local network IP instead:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
```

The phone and computer must be connected to the same network.

### 4. Start Expo

```bash
npx expo start
```

Then open the application using the appropriate Expo option for your device/emulator.

## API Overview

Base URL:

```text
/api
```

### Authentication

Register:

```http
POST /api/auth/register
```

Login:

```http
POST /api/auth/login
```

### Competition

Get competition details:

```http
GET /api/competitions/:competitionId
```

The response includes dynamic competition data, the calculated current lifecycle phase, and remaining participant spots.

### Registration

Register for a competition:

```http
POST /api/competitions/:competitionId/register
```

Get the current user's registration status:

```http
GET /api/competitions/:competitionId/registration
```

Cancel registration:

```http
DELETE /api/competitions/:competitionId/registration
```

These protected endpoints require:

```text
Authorization: Bearer <JWT>
```

### Submission

Submit an entry:

```http
POST /api/competitions/:competitionId/submit
```

Get the current user's submission:

```http
GET /api/competitions/:competitionId/submission
```

These endpoints require authentication.

## Database Models

### User

Stores:

- Name
- Email
- Password hash
- Created/updated timestamps

Passwords are hashed using `bcryptjs`.

### Competition

Stores:

- Competition title
- Lifecycle status
- Prize pool
- Entry fee
- Maximum participants
- Registered participant count
- Description
- Judge information
- Competition dates
- Rewards

### Registration

Stores:

- User ID
- Competition ID
- Registration status
- Created/updated timestamps

A unique compound index on:

```text
userId + competitionId
```

prevents duplicate registrations.

### Submission

Stores:

- User ID
- Competition ID
- Submission title
- Description
- Video URL
- Submission status
- Created/updated timestamps

A unique compound index on:

```text
userId + competitionId
```

prevents multiple submissions for the same competition.

## Competition Lifecycle

The backend calculates the current competition phase from the configured dates.

The supported lifecycle states include:

```text
DRAFT
REGISTRATION_OPEN
REGISTRATION_CLOSED
SUBMISSION_OPEN
SUBMISSION_CLOSED
JUDGING
COMPLETED
CANCELLED
```

The client uses the current phase to determine which actions should be available.

For this implementation, a user who has successfully registered can submit an entry immediately after registration. The official submission lifecycle still has its own configured start and deadline.

## Concurrency and Data Consistency

Participant capacity is enforced on the backend rather than relying only on the frontend.

During registration, the backend uses:

- MongoDB transactions
- An atomic participant-count increment
- A capacity condition
- A unique registration index

This prevents two users from successfully registering for the same final available spot through normal concurrent requests.

The frontend's displayed remaining-spots value is treated as informational; the backend remains the source of truth.

## Validation and Edge Cases

The backend handles cases including:

- Missing authentication token
- Invalid or expired JWT
- Duplicate account email
- Competition not found
- Registration after the deadline
- Registration when the competition is full
- Duplicate registration
- Cancellation after registration closes
- Submission without registration
- Submission outside the permitted competition phase
- Duplicate submission
- Missing submission fields
- Invalid video URL

Frontend validation is also used for better user feedback, while backend validation remains authoritative.

## Important Assumptions

- Users must create an account and authenticate before registering or submitting.
- A user can register only once for a competition.
- A user can submit only once for a competition.
- The backend is the source of truth for registration capacity and competition state.
- Competition lifecycle is derived from configured competition dates.
- A registered participant is allowed to submit immediately after registration in this implementation.
- Video submissions are represented by URLs instead of uploading video files directly to the application.
- The assignment focuses on the competition-details workflow rather than implementing a complete organizer/admin platform.

## Major Technical Decisions

### React Native + Expo

Expo was used to speed up React Native development and provide a straightforward development/testing workflow.

### Express REST API

The backend uses a REST-style API with separate routes and controllers for authentication, competition data, registration, and submissions.

### MongoDB + Mongoose

MongoDB provides flexible document storage while Mongoose provides schemas, validation, relationships through ObjectId references, and indexes.

### JWT Authentication

JWTs are issued after successful registration/login and sent with protected API requests.

### Transactions and Atomic Updates

Competition registration updates the participant count and creates the registration within a MongoDB transaction. The participant count is incremented only when the competition still has capacity.

### Database Constraints

Unique indexes are used as a second layer of protection against duplicate registration and duplicate submission.

## Trade-offs

### Video URL instead of file upload

The assignment requires a functional submission flow, but implementing a complete video-upload pipeline would introduce object storage, upload limits, processing, CDN delivery, and additional infrastructure.

Using a video URL keeps the implementation focused on the competition workflow.

### Single competition focus

The implementation is designed around the provided competition-details experience rather than building a complete competition management dashboard.

The data model and API use competition IDs so the backend can support multiple competitions.

### JWT without refresh-token infrastructure

JWT provides a simple authentication mechanism suitable for this assignment. A production application would typically need a more complete token/session strategy.

## Production Improvements

If this were developed further for production, I would consider:

- Refresh-token or secure session management
- Rate limiting and abuse protection
- Stronger request validation and schema validation
- More comprehensive automated tests
- CI/CD pipeline
- Centralized structured logging and monitoring
- Cloud object storage for video submissions
- CDN-backed media delivery
- Payment integration for entry fees
- Organizer/admin management APIs
- Pagination and caching for larger datasets
- More granular authorization/roles
- Improved error tracking
- Database migration/versioning strategy
- Load testing for high-concurrency registration scenarios

## Demo Flow

For the screen recording, demonstrate:

1. Create a new account.
2. Open the competition details.
3. Register for the competition.
4. Show the updated registration state and remaining spots.
5. Open **Submit Entry**.
6. Enter a title, description, and valid video URL.
7. Submit the entry.
8. Show the saved submission.
9. Log out.
10. Log back in.
11. Show that the previously submitted entry is still available.

## Competition Configuration

The repository includes a utility script for updating the demo competition dates:

```bash
cd server
node src/openRegistration.js
```

This is intended as a development/demo utility and is not an admin API.

## Security

Sensitive configuration should be stored in environment variables and must not be committed to Git.

The repository ignores environment files through `.gitignore`.

For a production deployment, secrets should be managed using the deployment platform's secret-management system rather than local `.env` files.

## Author

**Sagar Arora**

GitHub:

https://github.com/SagarArora74/Competition_platform
