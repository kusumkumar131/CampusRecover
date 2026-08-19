# CampusRecover — College Lost-and-Found Platform

**CampusRecover** is a production-style, privacy-first college lost-and-found web application. Students can register their belongings, attach a unique QR code to each individual item, report lost items, scan QR labels, and coordinate hanovers through an in-app secure messaging system.

---

## 🔒 Privacy Guarantee
- QR code scans **never** expose the owner's private email address, phone number, student ID, or private profile information.
- Finders and owners communicate exclusively inside the application sandbox until the handover is completed.

---

## 🛠️ Technology Stack

### Frontend Client
- **Framework:** React.js (Vite)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Styling:** Custom Vanilla CSS (Dark mode, glassmorphism, responsive drawers)
- **Scanning:** `html5-qrcode` & Development ID Scanner Simulator
- **QR Codes:** `qrcode` backend rendering & print layouts

### Backend Server
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) stored in HTTP-Only secure cookies
- **Security:** Helmet, CORS, bcryptjs password hashing
- **Validation:** `express-validator` request sanitizers

---

## 📂 Project Structure

```
CampusRecover/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Sidebar, Header, Mobile Bottom Tab Nav
│   │   ├── context/        # AuthContext (JWT verification & session check)
│   │   ├── layouts/        # DashboardLayout, AuthLayout wrappers
│   │   ├── pages/          # Landing, Dashboard, MyItems, QR, Scanner, Messaging, Profile, Admin
│   │   └── services/       # Axios API layer and services files
│   ├── package.json
│   └── vite.config.js
└── server/                 # Express Backend
    ├── config/             # Database connection
    ├── controllers/        # Business controllers (Auth, Item, Report, Messages, Admin)
    ├── models/             # Mongoose Schemas (User, Item, Report, Message, Notification, QRScan)
    ├── routes/             # REST endpoints
    ├── middleware/         # Auth cookie protection, express validations, global errors
    ├── seed/               # Demo account population scripts
    └── server.js           # Server entrypoint
```

---

## 🚀 Installation & Running

### Prerequisites
- Node.js installed (v18+)
- Local MongoDB running at `mongodb://localhost:27017`

### 1. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Seed the database with demo accounts:
   ```bash
   npm run seed
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
The frontend will run on `http://localhost:5173`.

---

## 👥 Demo / Testing Credentials

During `npm run seed`, the database is pre-populated with these testing accounts (passwords are all `Demo@123`):

### 👤 Student Owner (Kumar K.)
- **Email:** `kumar@example.com` (or use Student ID `STU1001`)
- **Password:** `Demo@123`
- *Preloaded Items:* Laptop, Laptop Charger (LOST), Sony Headphones (CONTACTED), Algorithms Textbook (RETURNED), Power Bank.

### 👤 Student Finder (Jane Doe)
- **Email:** `finder@example.com` (or use Student ID `STU1002`)
- **Password:** `Demo@123`
- *Preloaded Conversations:* Active chat thread with Kumar regarding his Sony headphones.

### 👑 Administrator (Admin Officer)
- **Email:** `admin@example.com` (or use Student ID `ADM1001`)
- **Password:** `Demo@123`
- *Role:* Access to user suspensions, report removals, and aggregated charts.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusrecover
JWT_SECRET=campus_recover_super_secret_session_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Signup and set JWT cookie |
| **POST** | `/api/auth/login` | Public | Login using Email/ID and set JWT cookie |
| **POST** | `/api/auth/logout` | Public | Clear JWT cookie |
| **GET** | `/api/auth/me` | Private | Retrieve logged-in session |
| **PATCH** | `/api/users/me` | Private | Update contact details (phone, dept, year) |
| **PATCH** | `/api/users/me/password` | Private | Update password (current vs new check) |
| **POST** | `/api/items` | Private | Register belonging & generate QR |
| **GET** | `/api/items/my-items` | Private | List belongings owned by current user |
| **GET** | `/api/qr/:itemId` | Public | Public scan details (Privacy-safe) |
| **POST** | `/api/reports/lost` | Private | Report registered item as LOST |
| **POST** | `/api/reports/found` | Private | Report a lost item as FOUND |
| **POST** | `/api/reports/:id/confirm-return` | Private | Confirm receipt (status -> SOLVED & RETURNED) |
| **POST** | `/api/messages` | Private | Send in-app chat message |
| **GET** | `/api/messages/:conversationId` | Private | Retrieve chat messages (restricted to participants) |
| **GET** | `/api/notifications` | Private | Get unread alerts |
| **GET** | `/api/admin/dashboard` | Admin | Get metrics & chart aggregates |

---

## 🔄 Core Recovery State Machine Flow

```
   [ ACTIVE / REGISTERED ]
             │
             ▼ (Owner clicks "Report Lost")
          [ LOST ]
             │
             ▼ (Finder scans QR code & clicks "I've Found This Item")
          [ FOUND ]
             │
             ▼ (Finder sends message to owner in chat)
        [ CONTACTED ]
             │
             ▼ (Owner or Finder clicks "Arrange Handover")
     [ HANDOVER_PENDING ]
             │
             ▼ (Owner meets finder & clicks "I Received It")
    [ RETURNED / SOLVED ]
```
