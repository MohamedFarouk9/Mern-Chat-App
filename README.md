# MERN Chat Application - Architecture & Implementation Guide

> A production-ready, enterprise-grade real-time chat application showcasing advanced MERN stack patterns, OAuth authentication, WebSocket integration, and modern software engineering practices.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Design Patterns & Principles](#design-patterns--principles)
5. [Database Design](#database-design)
6. [Backend Architecture](#backend-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [API Specification](#api-specification)
9. [Real-time Communication](#real-time-communication)
10. [Authentication & Authorization](#authentication--authorization)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)
13. [Error Handling Strategy](#error-handling-strategy)
14. [Testing Strategy](#testing-strategy)
15. [Deployment Guide](#deployment-guide)
16. [Development Workflow](#development-workflow)

---

## 1. Project Overview

### Vision
A modern, scalable chat application demonstrating:
- ✅ **Senior-level code organization** with clear separation of concerns
- ✅ **Production-ready patterns** (Singleton, Factory, Repository, Observer)
- ✅ **Enterprise security** (JWT, OAuth2, rate limiting, input validation)
- ✅ **Real-time capabilities** (Socket.io, WebSocket)
- ✅ **Scalable architecture** (microservice-ready, horizontally scalable)
- ✅ **Best practices** (logging, error handling, monitoring)

### Key Features
```
Core Features:
├─ User Authentication
│  ├─ Local registration/login
│  ├─ Google OAuth 2.0
│  └─ Email verification
├─ Real-time Messaging
│  ├─ Send/receive messages
│  ├─ Message status tracking (sent/delivered/read)
│  ├─ Emoji reactions
│  └─ File/image uploads via Cloudinary
├─ User Management
│  ├─ Friend system with requests
│  ├─ User search
│  ├─ Profile management
│  └─ Block/unblock users
├─ User Status
│  ├─ Online/offline status
│  ├─ Typing indicators
│  └─ Last seen timestamp
└─ Advanced Features
   ├─ Conversation muting/archiving
   ├─ Message notifications
   ├─ Dark/light theme
   └─ Message search
```

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                        │
│                    React 18 + Redux Toolkit                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ UI Components │ Redux Store │ Socket.io Client          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  (REST API + WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER LAYER (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes → Controllers → Services → Models                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Middleware: Auth, Validation, Error Handler, CORS        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Socket.io Server: Real-time Events                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  (MongoDB Query)
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER (MongoDB Atlas)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Users │ Messages │ Conversations │ Notifications         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  (File Storage)
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Cloudinary (Images) │ Google OAuth │ Nodemailer (Email)  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request/Response Flow

```
USER ACTION (Frontend)
        ↓
DISPATCH REDUX ACTION
        ↓
API CALL (Axios) OR SOCKET EVENT
        ↓
MIDDLEWARE PROCESSING
├─ CORS Check
├─ Rate Limiting
├─ JSON Parsing
└─ Request Logging
        ↓
ROUTE MATCHING
        ↓
AUTHENTICATION MIDDLEWARE
├─ Extract JWT from header
├─ Verify signature & expiry
└─ Attach user to req.user
        ↓
VALIDATION MIDDLEWARE
├─ Validate request body (Joi)
├─ Check required fields
└─ Sanitize input
        ↓
CONTROLLER
├─ Receive validated request
├─ Call appropriate service
└─ Return response
        ↓
SERVICE LAYER
├─ Execute business logic
├─ Database operations
└─ External API calls
        ↓
DATABASE OPERATION
├─ Query/Insert/Update
├─ Validation hooks
└─ Return result
        ↓
ERROR HANDLER (if error)
├─ Catch exception
├─ Log error
├─ Format response
└─ Return status code
        ↓
RESPONSE SENT
        ↓
FRONTEND RECEIVES
├─ Parse response
├─ Update Redux store
├─ Update UI
└─ Show feedback
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18+ | UI library with hooks |
| **State Management** | Redux Toolkit | 1.9+ | Global state management |
| **Styling** | TailwindCSS/CSS Modules | Latest | Responsive UI design |
| **HTTP Client** | Axios | 1.6+ | API requests |
| **Real-time** | Socket.io Client | 4.5+ | WebSocket client |
| **Form Handling** | React Hook Form | 7.5+ | Form state management |
| **Validation** | Zod/Yup | Latest | Frontend validation |
| **Routing** | React Router | 6+ | Page navigation |
| **Build Tool** | Vite | 4+ | Fast build & dev server |
| **Backend Framework** | Express | 4.18+ | HTTP server |
| **Database** | MongoDB | 6+ | NoSQL database |
| **ODM** | Mongoose | 7+ | MongoDB object modeling |
| **Authentication** | JWT + OAuth2 | Standard | Auth protocol |
| **Real-time** | Socket.io | 4.5+ | WebSocket server |
| **Validation** | Joi | 17+ | Backend validation |
| **Security** | Helmet | 7+ | Security headers |
| **Rate Limiting** | express-rate-limit | 7+ | Attack prevention |
| **Password Hashing** | bcryptjs | 2.4+ | Secure hashing |
| **Email** | Nodemailer | 6+ | Email sending |
| **File Upload** | Cloudinary + Multer | Latest | Cloud storage |
| **Environment** | Dotenv | 16+ | Config management |
| **Logging** | Custom Logger | Custom | Application logging |
| **Testing** | Jest + Supertest | Latest | Unit & integration tests |
| **Deployment** | Docker + Heroku/Railway | Latest | Containerization & hosting |

---

## 4. Design Patterns & Principles

### SOLID Principles Implementation

#### S - Single Responsibility Principle
```
✅ Each file has ONE reason to change

services/authService.js → Authentication logic only
services/emailService.js → Email sending only
services/userService.js → User management only
services/messageService.js → Message management only

controllers/authController.js → Routes to authService
controllers/userController.js → Routes to userService
```

#### O - Open/Closed Principle
```
✅ Open for extension, closed for modification

logger.js → New log types can be added without modifying existing code
validators.js → New validation schemas can be added
constants.js → New constants added without changing code logic
```

#### L - Liskov Substitution Principle
```
✅ Subtypes must be substitutable for base types

User models can be swapped without breaking code
Services follow consistent interface patterns
```

#### I - Interface Segregation Principle
```
✅ Clients depend on specific interfaces, not large ones

Middleware functions have single responsibility
Controllers call specific service methods, not entire service
```

#### D - Dependency Inversion Principle
```
✅ Depend on abstractions, not concretions

Controllers depend on services (abstraction)
Services depend on models (abstraction)
Middleware dependencies injected, not hardcoded
```

### Applied Design Patterns

#### 1. **Singleton Pattern**
```javascript
// db.js - Single MongoDB connection instance
// logger.js - Single logger for entire app
// Purpose: Prevent duplicate connections, consistent logging
let connectionInstance = null;
const connectDB = async () => {
  if (connectionInstance) return connectionInstance; // Reuse
  connectionInstance = await mongoose.connect(MONGO_URI);
  return connectionInstance;
};
```

#### 2. **Factory Pattern**
```javascript
// tokenUtil.js - Creates tokens with consistent structure
// Purpose: Centralize token creation, ensure consistency
export const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email, type: 'access' }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const generateVerificationToken = (userId) => {
  return jwt.sign({ userId, type: 'verification' }, JWT_SECRET, {
    expiresIn: '24h'
  });
};
```

#### 3. **Repository Pattern**
```javascript
// Models with static/instance methods act as repositories
// Purpose: Abstract data access from business logic

userSchema.statics.findByEmailOrUsername = function(emailOrUsername) {
  return this.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });
};

messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiverId: userId,
    status: { $ne: MESSAGE_STATUSES.READ }
  });
};
```

#### 4. **Service Layer Pattern**
```javascript
// All business logic in services
// Controllers just route requests to services
// Purpose: Reusable, testable, maintainable code

// Controller
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Service
export const registerUser = async (userData) => {
  // Validation logic
  // Database operations
  // Email sending
  // Token generation
};
```

#### 5. **Middleware Pattern**
```javascript
// Cross-cutting concerns handled in middleware
// Purpose: Separate concerns, DRY principle

app.use(corsMiddleware());           // CORS
app.use(helmet());                   // Security headers
app.use(express.json());             // JSON parsing
app.use(authLimiter);                // Rate limiting
app.use('/api/auth', authRoutes);    // Routes
app.use(errorHandler);               // Error handling (LAST!)
```

#### 6. **Observer Pattern**
```javascript
// Socket.io uses observer pattern for real-time events
// Purpose: Emit events, multiple listeners respond

io.on('connection', (socket) => {
  // Emit event
  socket.emit('user:online', { userId, status: 'online' });
  
  // Listen for events
  socket.on('message:send', (data) => {
    // Broadcast to other socket
    io.to(data.receiverId).emit('message:receive', data);
  });
});
```

#### 7. **Error Handling Pattern**
```javascript
// Custom AppError class with global handler
// Purpose: Consistent error responses

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  // Handle unexpected errors
};
```

---

## 5. Database Design

### Data Models

#### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  username: String (unique),
  password: String (hashed, select: false),
  firstName: String,
  lastName: String,
  profileImage: String (Cloudinary URL),
  bio: String,
  provider: String (local, google, github),
  providerId: String (OAuth provider ID),
  emailVerified: Boolean,
  verificationToken: String,
  verificationTokenExpiry: Date,
  status: String (online, offline, away),
  lastSeen: Date,
  friends: [ObjectId] (refs to User),
  friendRequests: [ObjectId],
  blockedUsers: [ObjectId],
  settings: {
    notificationsEnabled: Boolean,
    soundEnabled: Boolean,
    darkMode: Boolean
  },
  isActive: Boolean,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- email (unique)
- username (unique)
- createdAt (sorting)

#### Message Schema
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref User),
  receiverId: ObjectId (ref User),
  conversationId: ObjectId (ref Conversation),
  content: String (max 5000 chars),
  messageType: String (text, image, emoji, file),
  imageUrl: String (Cloudinary),
  fileUrl: String,
  fileMetadata: {
    filename: String,
    size: Number,
    mimeType: String
  },
  status: String (sent, delivered, read),
  deliveredAt: Date,
  readAt: Date,
  isDeleted: Boolean (soft delete),
  isEdited: Boolean,
  editedAt: Date,
  replyTo: ObjectId (ref Message),
  reactions: [
    {
      userId: ObjectId,
      emoji: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- conversationId + createdAt (message history)
- senderId (user's sent messages)
- receiverId + status (unread messages)
- status (filtering by delivery status)

#### Conversation Schema
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (refs to User, 2 for direct chat),
  lastMessage: ObjectId (ref Message),
  lastMessageTime: Date (for sorting),
  name: String (for group chats),
  avatar: String (group chat avatar),
  type: String (direct, group),
  mutedBy: [ObjectId] (users who muted),
  archivedBy: [ObjectId] (users who archived),
  metadata: {
    messageCount: Number,
    createdBy: ObjectId
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- participants (unique compound index)
- lastMessageTime (sorting conversations)
- participants._id (finding user's conversations)

#### Notification Schema (Optional)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  type: String (message, friend_request, mention),
  senderId: ObjectId (ref User),
  messageId: ObjectId (ref Message),
  conversationId: ObjectId (ref Conversation),
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

**Indexes:**
- userId + isRead (unread notifications)
- userId + createdAt (notification feed)

### Database Relationships

```
User (1) ──── (M) Message ──── (1) Conversation ──── (M) User
  ↓
friends[]
friendRequests[]
blockedUsers[]
settings
```

### Data Consistency Strategies

```
1. Pre-save Hooks (Auto-validation & modification)
   - Hash password when modified
   - Sort conversation participants
   - Set token expiry timestamps

2. Indexes (Fast queries)
   - Unique indexes for email, username
   - Compound indexes for conversation lookup
   - Descending indexes for sorting

3. Soft Deletes (Data recovery)
   - isDeleted flag instead of hard delete
   - Messages can be recovered
   - Queries exclude soft-deleted items

4. Referential Integrity
   - Use ObjectId refs with populate()
   - Manual consistency checks in services
   - Cascade operations when needed
```

---

## 6. Backend Architecture

### Folder Structure

```
backend/
├── config/                    # Configuration & Setup
│   ├── db.js                 # MongoDB connection (Singleton)
│   ├── envConfig.js          # Environment validation
│   └── constants.js          # App-wide constants
│
├── models/                    # Database Models & Schemas
│   ├── User.js               # User schema with methods
│   ├── Message.js            # Message schema with methods
│   ├── Conversation.js       # Conversation schema with methods
│   └── Notification.js       # Notification schema
│
├── controllers/               # Request Handlers (HTTP layer)
│   ├── authController.js     # Auth endpoints: register, login, verify
│   ├── userController.js     # User endpoints: profile, search, friends
│   └── messageController.js  # Message endpoints: send, retrieve, read
│
├── services/                  # Business Logic (core logic)
│   ├── authService.js        # Auth logic: register, login, OAuth
│   ├── userService.js        # User logic: profile, friends, search
│   ├── messageService.js     # Message logic: send, retrieve, status
│   └── emailService.js       # Email sending (real & mock modes)
│
├── routes/                    # API Endpoints Definition
│   ├── auth.js              # /api/auth/* routes
│   ├── user.js              # /api/user/* routes
│   └── message.js           # /api/message/* routes
│
├── middleware/                # Cross-cutting Concerns
│   ├── authMiddleware.js     # JWT verification
│   ├── errorHandler.js       # Global error handler
│   ├── validator.js          # Request validation
│   ├── corsMiddleware.js     # CORS configuration
│   └── rateLimiter.js        # Rate limiting
│
├── utils/                     # Reusable Utilities
│   ├── logger.js             # Logging (Singleton)
│   ├── tokenUtil.js          # JWT operations (Factory)
│   ├── hashUtil.js           # Password hashing
│   └── validators.js         # Joi validation schemas
│
├── socket/                    # Real-time Communication
│   └── socketHandler.js      # Socket.io event handlers
│
├── app.js                     # Express app setup
├── server.js                  # Server startup
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example               # Environment template
├── .gitignore                 # Git exclusions
└── package.json               # Dependencies & scripts
```

### Request Flow: Complete Example

**User Registration Request:**

```
1. FRONTEND (React)
   ├─ User fills registration form
   ├─ Validates using React Hook Form
   └─ Dispatches Redux action: authThunk.register(userData)

2. REDUX THUNK
   ├─ Calls: POST /api/auth/register with userData
   └─ Sends: { email, password, firstName, lastName, username }

3. MIDDLEWARE STACK (app.js order matters!)
   ├─ corsMiddleware() → Allow cross-origin
   ├─ helmet() → Add security headers
   ├─ morgan() → Log request
   ├─ express.json() → Parse JSON body
   ├─ authLimiter → Check rate limit (5 requests/15min)
   └─ Router finds matching route: /api/auth/register

4. ROUTE HANDLER (routes/auth.js)
   ├─ Route: POST /api/auth/register
   ├─ Middleware: validateRegister (Joi validation)
   └─ Handler: authController.register

5. VALIDATION MIDDLEWARE
   ├─ Validate using registerSchema (Joi)
   ├─ Check: email format, password strength, etc.
   ├─ Sanitize: trim whitespace, lowercase email
   └─ Proceed if valid, else return 400 Bad Request

6. CONTROLLER (authController.js)
   ├─ Extract validated data from req.body
   ├─ Call: authService.registerUser(userData)
   └─ Catch errors → pass to next(error)

7. SERVICE (authService.js)
   ├─ Check: email/username not already exists
   ├─ Create: verification token
   ├─ Save: new User (pre-save hook hashes password)
   ├─ Generate: JWT access token
   ├─ Send: verification email (real or mock)
   └─ Return: { user, token, message }

8. DATABASE (models/User.js)
   ├─ Pre-save hook: Hash password with bcryptjs
   ├─ Validation: Check email/username unique
   ├─ Save: Insert document to MongoDB
   └─ Return: Saved user with _id

9. RESPONSE
   ├─ Controller receives service result
   ├─ Format: { success: true, data: result }
   ├─ Status: 201 Created
   └─ Send to client

10. FRONTEND
    ├─ Redux thunk receives response
    ├─ Update: auth state with user & token
    ├─ Store: token in localStorage
    ├─ Redirect: to email verification page
    └─ Show: "Check your email" message

11. ERROR SCENARIO
    ├─ Service throws: new Error("Email already exists")
    ├─ Controller catches in try/catch
    ├─ Next middleware: next(error)
    ├─ Global error handler catches
    ├─ Format: { success: false, message: error.message }
    ├─ Status: 409 Conflict
    └─ Send to frontend
```

---

## 7. Frontend Architecture

### Folder Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI Components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── OAuthButton.jsx
│   │   │   └── EmailVerification.jsx
│   │   ├── messenger/
│   │   │   ├── Messenger.jsx    # Main chat layout
│   │   │   ├── ChatWindow.jsx   # Chat area
│   │   │   ├── FriendList.jsx   # Sidebar friends
│   │   │   ├── MessageItem.jsx  # Single message
│   │   │   └── MessageInput.jsx # Input area
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Toast.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── Input.jsx
│   │       └── Avatar.jsx
│   │
│   ├── redux/                   # State Management
│   │   ├── store.js             # Redux store config
│   │   ├── slices/
│   │   │   ├── authSlice.js     # Auth state
│   │   │   ├── userSlice.js     # User state
│   │   │   ├── messageSlice.js  # Messages state
│   │   │   ├── friendSlice.js   # Friends state
│   │   │   └── uiSlice.js       # UI state (theme, sidebar)
│   │   └── thunks/
│   │       ├── authThunks.js    # Async auth actions
│   │       ├── userThunks.js    # Async user actions
│   │       └── messageThunks.js # Async message actions
│   │
│   ├── services/                # External API & Socket
│   │   ├── api.js               # Axios instance config
│   │   ├── authService.js       # Auth API calls
│   │   ├── userService.js       # User API calls
│   │   ├── messageService.js    # Message API calls
│   │   └── socketService.js     # Socket.io client setup
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.js           # Auth state hook
│   │   ├── useSocket.js         # Socket events hook
│   │   ├── useMessage.js        # Message operations hook
│   │   └── useUser.js           # User operations hook
│   │
│   ├── pages/                   # Page Components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── EmailVerificationPage.jsx
│   │   ├── MessengerPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── styles/                  # Global Styles
│   │   ├── global.css
│   │   ├── variables.css        # CSS variables (colors, fonts)
│   │   └── themes.css           # Theme definitions
│   │
│   ├── utils/                   # Utility Functions
│   │   ├── validation.js        # Input validation
│   │   ├── formatters.js        # Date, message formatting
│   │   ├── localStorage.js      # Local storage helpers
│   │   └── constants.js         # App constants
│   │
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Vite entry point
│   └── index.html               # HTML template
│
├── .env.local                   # Local environment variables
├── .gitignore
├── vite.config.js               # Vite configuration
└── package.json
```

### Redux State Structure

```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: {
      _id: string,
      email: string,
      username: string,
      firstName: string,
      lastName: string,
      profileImage: string,
      status: string
    },
    token: string,
    emailVerified: boolean,
    loading: boolean,
    error: string | null
  },

  user: {
    profile: {
      _id: string,
      username: string,
      firstName: string,
      lastName: string,
      bio: string,
      profileImage: string,
      friends: []
    },
    friends: [
      {
        _id: string,
        username: string,
        firstName: string,
        lastName: string,
        status: string,
        lastSeen: Date
      }
    ],
    friendRequests: [],
    searchResults: [],
    loading: boolean,
    error: string | null
  },

  message: {
    conversations: [
      {
        _id: string,
        participants: [],
        lastMessage: {},
        lastMessageTime: Date,
        unreadCount: number
      }
    ],
    currentConversationId: string,
    messages: [
      {
        _id: string,
        senderId: string,
        content: string,
        status: string,
        createdAt: Date,
        reactions: []
      }
    ],
    loading: boolean,
    error: string | null
  },

  ui: {
    theme: 'light' | 'dark',
    sidebarOpen: boolean,
    selectedFriendId: string | null,
    notifications: [
      {
        id: string,
        message: string,
        type: 'success' | 'error' | 'info'
      }
    ]
  }
}
```

### Component Communication Pattern

```
App.jsx (Root)
  ├─ Private Route Guard
  │   └─ Checks: auth.isAuthenticated
  │       ├─ If false → Redirect to Login
  │       └─ If true → Render protected component
  │
  ├─ MessengerPage.jsx (Main layout)
  │   ├─ Sidebar.jsx
  │   │   ├─ FriendList.jsx
  │   │   │   ├─ Dispatches: selectFriend(friendId)
  │   │   │   └─ Updates Redux: message.currentConversationId
  │   │   │
  │   │   └─ SearchUsers.jsx
  │   │       ├─ Dispatches: searchUsersThunk(query)
  │   │       └─ Displays: user.searchResults
  │   │
  │   └─ ChatWindow.jsx (Main chat)
  │       ├─ MessageList.jsx
  │       │   └─ Maps: message.messages
  │       │       ├─ MessageItem.jsx (each message)
  │       │       │   └─ Emits Socket: "message:read"
  │       │       └─ Updates Redux: messageSlice.markAsRead()
  │       │
  │       └─ MessageInput.jsx
  │           ├─ onSubmit: Dispatches messageThunk.sendMessage()
  │           ├─ Service: POST /api/message/send
  │           ├─ Socket: emit("message:send", data)
  │           └─ Updates Redux: messageSlice.addMessage()

Data Flow Pattern:
1. User interaction in component
2. Dispatch Redux thunk (async action)
3. Thunk calls API service
4. Service makes HTTP request
5. Backend returns response
6. Thunk dispatches synchronous action
7. Reducer updates state
8. Component re-renders (useSelector hooks)
9. Real-time updates via Socket.io events
```

---

## 8. API Specification

### Authentication Endpoints

#### POST /api/auth/register
```javascript
// Request
{
  email: "user@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe"
}

// Success Response (201)
{
  success: true,
  message: "Registration successful. Please verify your email.",
  data: {
    user: {
      _id: "user_id",
      email: "user@example.com",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe"
    },
    token: "eyJhbGciOiJIUzI1NiIs..."
  }
}

// Error Response (409)
{
  success: false,
  message: "Email already registered"
}
```

#### POST /api/auth/login
```javascript
// Request
{
  email: "user@example.com",
  password: "SecurePass123!"
}

// Success Response (200)
{
  success: true,
  message: "Login successful",
  data: {
    user: { _id, email, username, firstName, lastName, profileImage, status },
    token: "eyJhbGciOiJIUzI1NiIs..."
  }
}

// Error Scenarios
// 401 - Invalid credentials
// 401 - Email not verified
```

#### POST /api/auth/google
```javascript
// Request
{
  googleToken: "google_id_token_from_frontend"
}

// Success Response (200 or 201)
{
  success: true,
  message: "Login successful",
  data: {
    user: { _id, email, username, firstName, lastName, profileImage, status },
    token: "eyJhbGciOiJIUzI1NiIs...",
    isNewUser: false
  }
}
```

#### GET /api/auth/verify-email?token=XXX
```javascript
// Success Response (200)
{
  success: true,
  message: "Email verified successfully"
}

// Error Response (400)
{
  success: false,
  message: "Invalid or expired token"
}
```

#### POST /api/auth/verify-email-mock
```javascript
// Request
{
  email: "user@example.com"
}

// Response (200)
{
  success: true,
  message: "Email verified successfully"
}

// Note: Only available in development mode
```

### User Endpoints

#### GET /api/user/profile
```javascript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  success: true,
  data: {
    _id: "user_id",
    email: "user@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    profileImage: "https://cloudinary.../image.jpg",
    bio: "Hello, I'm John",
    status: "online",
    friends: ["friend_id_1", "friend_id_2"],
    friendRequests: []
  }
}
```

#### PUT /api/user/profile
```javascript
// Request
{
  firstName: "John",
  lastName: "Smith",
  bio: "Updated bio",
  profileImage: "https://cloudinary.../newimage.jpg"
}

// Response (200)
{
  success: true,
  message: "Profile updated successfully",
  data: { updated user object }
}
```

#### GET /api/user/search?query=john&limit=20&page=1
```javascript
// Response (200)
{
  success: true,
  data: {
    users: [
      {
        _id: "user_id",
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        profileImage: "...",
        status: "online"
      }
    ],
    total: 5,
    page: 1,
    limit: 20,
    pages: 1
  }
}
```

#### GET /api/user/friends
```javascript
// Response (200)
{
  success: true,
  data: [
    {
      _id: "friend_id",
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      profileImage: "...",
      status: "online",
      lastSeen: "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/user/friends/request/:friendId
```javascript
// Response (201)
{
  success: true,
  message: "Friend request sent"
}
```

#### POST /api/user/friends/accept/:friendId
```javascript
// Response (200)
{
  success: true,
  message: "Friend request accepted"
}
```

#### DELETE /api/user/friends/:friendId
```javascript
// Response (200)
{
  success: true,
  message: "Friend removed"
}
```

#### POST /api/user/block/:userId
```javascript
// Response (200)
{
  success: true,
  message: "User blocked"
}
```

### Message Endpoints

#### POST /api/message/send
```javascript
// Headers: Authorization: Bearer <token>

// Request
{
  receiverId: "user_id",
  content: "Hello!",
  messageType: "text",
  imageUrl: "https://cloudinary.../image.jpg" // if messageType: image
}

// Response (201)
{
  success: true,
  message: "Message sent successfully",
  data: {
    _id: "message_id",
    senderId: { _id, username, firstName, lastName, profileImage },
    receiverId: { _id, username, firstName, lastName, profileImage },
    content: "Hello!",
    messageType: "text",
    status: "sent",
    createdAt: "2024-01-15T10:30:00Z",
    reactions: []
  }
}
```

#### GET /api/message/history/:conversationId?limit=20&page=1
```javascript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  success: true,
  data: {
    messages: [
      {
        _id: "message_id",
        senderId: { ...user },
        content: "Hello!",
        status: "read",
        createdAt: "2024-01-15T10:30:00Z",
        reactions: [
          { userId: "user_id", emoji: "😊" }
        ]
      }
    ],
    total: 150,
    page: 1,
    limit: 20,
    pages: 8
  }
}
```

#### PUT /api/message/:messageId/read
```javascript
// Response (200)
{
  success: true,
  message: "Message marked as read",
  data: { updated message }
}
```

#### DELETE /api/message/:messageId
```javascript
// Response (200)
{
  success: true,
  message: "Message deleted"
}
```

#### POST /api/message/:messageId/reaction
```javascript
// Request
{
  emoji: "😊"
}

// Response (200)
{
  success: true,
  message: "Reaction added"
}
```

---

## 9. Real-time Communication

### Socket.io Events

#### Client → Server Events

```javascript
// User comes online
socket.emit('user:online', {
  userId: "user_id",
  status: "online"
});

// Send message
socket.emit('message:send', {
  conversationId: "conv_id",
  senderId: "user_id",
  receiverId: "user_id",
  content: "Hello!",
  messageType: "text"
});

// Message delivered
socket.emit('message:delivered', {
  messageId: "message_id",
  status: "delivered"
});

// Message read
socket.emit('message:read', {
  conversationId: "conv_id",
  messageId: "message_id"
});

// User typing
socket.emit('user:typing', {
  conversationId: "conv_id",
  userId: "user_id"
});

// User stopped typing
socket.emit('user:stopped-typing', {
  conversationId: "conv_id"
});
```

#### Server → Client Events

```javascript
// User status changed
socket.on('user:status-changed', (data) => {
  // { userId, status: 'online'|'offline'|'away' }
  // Update UI to show user is online
});

// Receive message
socket.on('message:receive', (data) => {
  // { messageId, senderId, content, timestamp }
  // Add message to chat, play notification sound
});

// Message delivery confirmation
socket.on('message:delivered', (data) => {
  // { messageId, deliveredAt }
  // Update message status in UI
});

// Message read receipt
socket.on('message:read', (data) => {
  // { messageId, readAt }
  // Update message status in UI
});

// User typing indicator
socket.on('user:typing', (data) => {
  // { conversationId, userId }
  // Show "Jane is typing..." indicator
});

// User stopped typing
socket.on('user:stopped-typing', (data) => {
  // Remove typing indicator
});
```

### Socket.io Server Implementation

```javascript
// io/socketHandler.js (Observer Pattern)

import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../config/constants.js';

// Map to store active user connections
const activeUsers = new Map(); // userId -> socketId

export const setupSocketHandlers = (io) => {
  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      activeUsers.set(userId, socket.id);
      logger.info('User connected:', { userId, socketId: socket.id });
      
      // Notify all users that this user is online
      io.emit(SOCKET_EVENTS.USER_ONLINE, {
        userId,
        status: 'online',
        timestamp: new Date()
      });
    }

    // Handle incoming messages
    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
      const { receiverId, content, messageType } = data;
      
      // Emit to receiver's socket
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
          ...data,
          status: 'delivered'
        });
      }
      
      logger.info('Message sent:', {
        from: userId,
        to: receiverId
      });
    });

    // Handle typing indicator
    socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit(SOCKET_EVENTS.USER_TYPING, {
          userId,
          conversationId
        });
      }
    });

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      activeUsers.delete(userId);
      logger.info('User disconnected:', { userId });
      
      io.emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId,
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });
};
```

---

## 10. Authentication & Authorization

### JWT Token Flow

```
1. User Registration/Login
   ├─ Service: authService.registerUser() or authService.loginUser()
   ├─ Generate: generateAccessToken(userId, email)
   └─ Return: Token to frontend

2. Token Storage (Frontend)
   ├─ localStorage.setItem('token', token)
   ├─ OR Secure HTTP-only cookie (more secure)
   └─ Include in Redux auth state

3. Authenticated Requests
   ├─ Frontend adds header: Authorization: Bearer <token>
   ├─ Every request to protected routes must include this
   └─ Example: axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

4. Token Verification (Backend)
   ├─ authMiddleware intercepts request
   ├─ Extracts token from Authorization header
   ├─ Calls: verifyToken(token)
   ├─ JWT.verify checks:
   │  ├─ Signature is valid (wasn't tampered)
   │  ├─ Token not expired
   │  └─ Payload matches expected format
   ├─ If valid: Attach user info to req.user
   └─ If invalid: Return 401 Unauthorized

5. Token Expiry & Refresh
   ├─ Access token expires in 7 days
   ├─ On expiry: Frontend redirects to login
   ├─ Future enhancement: Implement refresh tokens
   │  ├─ Keep short-lived access token (15 minutes)
   │  ├─ Issue long-lived refresh token (30 days)
   │  └─ Auto-refresh using refresh endpoint
   └─ Logout: Delete token from localStorage
```

### OAuth 2.0 Google Flow

```
1. Frontend Setup
   ├─ Install: @react-oauth/google
   ├─ Wrap app with: <GoogleOAuthProvider clientId={...}>
   └─ Add GoogleLogin button component

2. User Clicks "Login with Google"
   ├─ Google sign-in dialog appears
   ├─ User authenticates with Google account
   ├─ Google returns: ID Token (JWT)
   └─ Frontend receives token

3. Frontend Sends Token to Backend
   ├─ POST /api/auth/google
   └─ Body: { googleToken: "google_id_token" }

4. Backend Verification
   ├─ Initialize: const client = new OAuth2Client(GOOGLE_CLIENT_ID)
   ├─ Verify: client.verifyIdToken({ idToken, audience })
   ├─ Check: Token signature, expiry, audience
   └─ Extract: email, given_name, family_name, picture

5. User Lookup/Creation
   ├─ Query: User.findOne({ email })
   ├─ If exists:
   │  ├─ Check provider matches (not registered differently)
   │  └─ Login user
   └─ If not exists:
      ├─ Create new user with:
      │  ├─ provider: 'google'
      │  ├─ providerId: google.sub (Google unique ID)
      │  ├─ emailVerified: true (Google verified)
      │  └─ Generate username from email
      └─ Save and login

6. Return Token to Frontend
   ├─ Generate: JWT access token
   ├─ Return: user data + token
   └─ Frontend stores and makes authenticated requests

Benefits:
✅ No password required
✅ Leverages Google's security
✅ Better UX (faster sign-in)
✅ Verified email from Google
```

### Authorization Levels

```
Public Routes (No auth required)
├─ GET /api/user/public/:userId
├─ POST /api/auth/register
├─ POST /api/auth/login
└─ POST /api/auth/google

Protected Routes (JWT required)
├─ GET /api/auth/verify-email?token=...
├─ GET /api/user/profile
├─ PUT /api/user/profile
├─ GET /api/user/search
├─ GET /api/user/friends
├─ POST /api/user/friends/request/:friendId
├─ POST /api/message/send
├─ GET /api/message/history/:conversationId
└─ PUT /api/message/:messageId/read

Resource-Specific Authorization
├─ Can only edit own profile
├─ Can only read messages from own conversations
├─ Can only delete own messages
├─ Can only view friends' limited profiles
└─ Cannot message blocked users
```

---

## 11. Security Considerations

### Authentication Security

```
✅ Passwords
   ├─ Hash with bcryptjs (10 salt rounds)
   ├─ Never store plaintext
   ├─ Never log password
   └─ Require: 8+ chars, uppercase, lowercase, number, special char

✅ JWT Tokens
   ├─ Signed with strong secret (32+ characters)
   ├─ Include expiry (7 days for access token)
   ├─ Verify signature on every request
   ├─ Check not expired
   └─ Don't store sensitive data in payload (base64 decoding reveals)

✅ Email Verification
   ├─ Generate random token for verification
   ├─ Token expires in 24 hours
   ├─ Can't access app until verified
   ├─ Email confirms user owns email address
   └─ Prevents typos in registration

✅ OAuth
   ├─ Verify Google token with Google's servers
   ├─ Use official SDK (google-auth-library)
   ├─ Check audience matches our app
   ├─ Validate signature (not just decode)
   └─ Automatically verified email from Google
```

### Transport Security

```
✅ CORS Configuration
   ├─ Whitelist only known origins
   ├─ Restrict methods to needed (GET, POST, PUT, DELETE)
   ├─ Only allow necessary headers
   ├─ Allow credentials for auth headers
   └─ Preflight requests cached (1 hour)

✅ HTTPS/TLS
   ├─ All traffic encrypted in production
   ├─ Valid SSL certificate
   ├─ HSTS headers (Helmet.js)
   └─ No mixed content (HTTP + HTTPS)

✅ Headers (Helmet.js)
   ├─ X-Frame-Options: DENY (prevent clickjacking)
   ├─ X-Content-Type-Options: nosniff (prevent MIME sniffing)
   ├─ Content-Security-Policy (prevent XSS)
   ├─ Strict-Transport-Security (force HTTPS)
   └─ X-XSS-Protection (browser XSS filtering)
```

### Input Validation & Sanitization

```
✅ Frontend Validation
   ├─ React Hook Form for form handling
   ├─ Real-time validation feedback
   ├─ Prevent submission of invalid data
   └─ Better UX with instant feedback

✅ Backend Validation (CRITICAL - don't trust frontend)
   ├─ Joi schema validation
   ├─ Check required fields
   ├─ Validate email format
   ├─ Validate password strength
   ├─ Check string length (prevent long strings)
   ├─ Trim whitespace
   ├─ Convert to appropriate types
   ├─ Reject unknown fields
   └─ Return 400 Bad Request if invalid

✅ Database Validation
   ├─ Mongoose schema validation
   ├─ Field type checking
   ├─ Length constraints
   ├─ Enum validation
   ├─ Unique index enforcement
   └─ Pre-save hooks for custom validation

✅ XSS Prevention
   ├─ React auto-escapes content
   ├─ Don't use dangerouslySetInnerHTML
   ├─ Sanitize user-generated content
   ├─ Content-Security-Policy headers
   └─ No eval() or Function() constructors
```

### Rate Limiting & DDoS Protection

```
✅ Rate Limiter Configuration
   ├─ Auth endpoints: 5 requests per 15 minutes
   │  └─ Prevents brute force attacks
   ├─ Message endpoints: 20 messages per minute
   │  └─ Prevents message spam
   ├─ General endpoints: 100 requests per 15 minutes
   │  └─ Prevents API abuse
   └─ Skip in test environment

✅ Implementation
   ├─ Use express-rate-limit
   ├─ Key: Client IP address
   ├─ Store: In-memory (single server)
   │  └─ For distributed: use Redis
   ├─ Response: 429 Too Many Requests
   └─ Headers: RateLimit-* (info about limits)

✅ DDoS Protection
   ├─ Rate limiting (first layer)
   ├─ Cloudflare/WAF (infrastructure layer)
   ├─ Connection timeouts
   ├─ Request size limits
   └─ Monitor traffic patterns
```

### Data Protection

```
✅ Password Reset
   ├─ Generate secure token (only valid 1 hour)
   ├─ Send via email (not SMS)
   ├─ Verify token before allowing reset
   ├─ Hash new password immediately
   └─ Invalidate old sessions

✅ Sensitive Data
   ├─ Don't return passwords in responses
   ├─ Use select: false in Mongoose
   ├─ Don't log passwords or tokens
   ├─ Clear sensitive data after use
   └─ Use environment variables (never hardcoded)

✅ Data Privacy
   ├─ Only return user's own data by default
   ├─ Public profiles: limited info only
   ├─ Friend check: can access friend's profile
   ├─ Message access: only conversation participants
   └─ Soft deletes: allow message recovery

✅ Email Security
   ├─ Use Nodemailer with Gmail App Password (if 2FA)
   ├─ Never send passwords in email
   ├─ Include expiring links (24 hours)
   ├─ Verify email ownership
   └─ Mock mode for development (no real emails)
```

### Environment Security

```
✅ Secrets Management
   ├─ .env file (DO NOT COMMIT)
   ├─ .gitignore prevents accidental commit
   ├─ Different .env files per environment
   │  ├─ .env.development (local)
   │  ├─ .env.staging (test server)
   │  └─ .env.production (live)
   └─ Environment variables via hosting provider

✅ Secret Rotation
   ├─ JWT_SECRET: Change quarterly
   ├─ Database credentials: Change regularly
   ├─ OAuth credentials: Monitor for breaches
   └─ Email password: Use App Password (regenerate)

✅ Production Checklist
   ├─ NODE_ENV=production
   ├─ All secrets in environment variables
   ├─ HTTPS enforced
   ├─ CORS origin specific (not *)
   ├─ Rate limiting enabled
   ├─ Logging configured
   ├─ Error messages non-revealing
   ├─ Database backups enabled
   ├─ Monitoring/alerting setup
   └─ Security headers all set
```

---

## 12. Performance Optimization

### Frontend Performance

```
✅ Code Splitting
   ├─ React.lazy() for route components
   ├─ Suspense boundaries for loading states
   ├─ Bundle analyzer: identify large imports
   └─ Lazy load images (Intersection Observer)

✅ State Management
   ├─ Redux selector memoization
   ├─ useSelector only subscribes to needed state
   ├─ Avoid unnecessary re-renders
   ├─ Normalize state shape (flat, no nesting)
   └─ Pagination for large lists

✅ Caching
   ├─ HTTP cache headers from backend
   ├─ Browser cache for static assets
   ├─ Redux persist (save state to localStorage)
   ├─ Message history pagination (only load recent)
   └─ User list pagination (load on scroll)

✅ Socket.io Optimization
   ├─ Only emit necessary data
   ├─ Batch message updates
   ├─ Debounce typing indicators
   ├─ Disconnect when not in focus
   └─ Compress large payloads
```

### Backend Performance

```
✅ Database Indexing
   ├─ Index frequently queried fields
   ├─ Compound indexes for common queries
   ├─ Monitor slow queries with MongoDB Profiler
   ├─ Example indices:
   │  ├─ User: email, username, createdAt
   │  ├─ Message: conversationId+createdAt, status
   │  └─ Conversation: participants, lastMessageTime
   └─ Avoid full collection scans

✅ Query Optimization
   ├─ Use projection to fetch only needed fields
   ├─ Example: User.findById(id).select('username email profileImage')
   ├─ Populate relationships smartly
   ├─ Pagination: limit + skip
   ├─ Aggregate pipelines for complex queries
   └─ Cache frequent queries (Redis future)

✅ Connection Pooling
   ├─ Mongoose manages connection pool
   ├─ Default: 10 connections
   ├─ For high traffic: increase pool size
   ├─ Monitor active connections
   └─ Connection timeout: 45 seconds

✅ Caching Strategy
   ├─ User profiles (cache 1 hour)
   ├─ Search results (cache 5 minutes)
   ├─ Friend lists (cache 30 minutes)
   ├─ Message history (cache 24 hours)
   └─ Redis implementation (future)

✅ Compression
   ├─ Gzip responses (compression middleware)
   ├─ Reduce payload size by 70%
   ├─ Enable on all text responses
   └─ Configure: app.use(compression())

✅ Load Balancing (Scaling)
   ├─ Run multiple server instances
   ├─ Use load balancer (Nginx, HAProxy)
   ├─ Share session state (use Redis)
   ├─ Database read replicas
   └─ CDN for static assets
```

---

## 13. Error Handling Strategy

### Error Types & Responses

```
✅ Validation Errors (400 Bad Request)
   Request body doesn't match schema
   
   Response:
   {
     success: false,
     message: "Validation failed",
     errors: [
       { field: "email", message: "Invalid email format" },
       { field: "password", message: "Password must contain uppercase" }
     ]
   }

✅ Authentication Errors (401 Unauthorized)
   Invalid credentials or missing/expired token
   
   Response:
   {
     success: false,
     message: "Invalid email or password"
   }

✅ Authorization Errors (403 Forbidden)
   User authenticated but not authorized
   
   Response:
   {
     success: false,
     message: "You do not have permission to access this resource"
   }

✅ Not Found Errors (404 Not Found)
   Resource doesn't exist
   
   Response:
   {
     success: false,
     message: "User not found"
   }

✅ Conflict Errors (409 Conflict)
   Duplicate or constraint violation
   
   Response:
   {
     success: false,
     message: "Email already registered"
   }

✅ Rate Limit Errors (429 Too Many Requests)
   Too many requests from IP
   
   Response:
   {
     success: false,
     message: "Too many login attempts, please try again later"
   }

✅ Server Errors (500 Internal Server Error)
   Unexpected server error
   
   Response (Production):
   {
     success: false,
     message: "An error occurred. Please try again later."
   }
   
   Response (Development):
   {
     success: false,
     message: "...",
     error: {
       name: "Error",
       stack: "..."
     }
   }
```

### Error Handling Flow

```
FRONTEND
├─ User action triggers error
├─ Redux thunk catches error
├─ Dispatch error action
├─ Reducer stores error message
├─ Component displays error via Toast/Alert
└─ User sees: "Invalid email or password"

BACKEND
├─ Controller receives invalid request
├─ Throws Error or AppError
├─ Try/catch block catches error
├─ next(error) passes to error handler
├─ Error handler middleware:
│  ├─ Checks error type
│  ├─ Formats response
│  ├─ Logs error with context
│  └─ Returns appropriate HTTP status
└─ Client receives formatted error

LOGGING
├─ Development: Full error details + stack trace
├─ Production: Only error message (privacy)
├─ All errors logged with:
│  ├─ Timestamp
│  ├─ Error message
│  ├─ Stack trace
│  ├─ User ID (if authenticated)
│  ├─ Endpoint
│  └─ Request ID (for tracing)
└─ Log location: /logs/app.log
```

---

## 14. Testing Strategy

### Backend Testing

```
✅ Unit Tests
   Location: __tests__/unit/
   
   Test files:
   ├─ utils/tokenUtil.test.js
   │  ├─ generateAccessToken() creates valid token
   │  ├─ verifyToken() validates correctly
   │  ├─ expiredToken throws error
   │  └─ malformedToken throws error
   │
   ├─ utils/hashUtil.test.js
   │  ├─ hashPassword() hashes correctly
   │  ├─ comparePassword() matches correctly
   │  └─ different passwords don't match
   │
   ├─ services/authService.test.js
   │  ├─ registerUser creates new user
   │  ├─ loginUser authenticates correctly
   │  ├─ duplicate email throws error
   │  └─ wrong password throws error
   │
   └─ services/userService.test.js
      ├─ searchUsers returns matching users
      ├─ sendFriendRequest validates
      └─ removeFriend works correctly

✅ Integration Tests
   Location: __tests__/integration/
   
   Test files:
   ├─ routes/auth.test.js
   │  ├─ POST /api/auth/register returns token
   │  ├─ POST /api/auth/login returns user
   │  ├─ GET /api/auth/verify-email verifies
   │  └─ Invalid requests return 400
   │
   ├─ routes/user.test.js
   │  ├─ GET /api/user/profile returns user data
   │  ├─ Protected routes without token return 401
   │  └─ Friend operations work correctly
   │
   └─ routes/message.test.js
      ├─ POST /api/message/send creates message
      ├─ GET /api/message/history returns paginated
      └─ Only participants can access

✅ Running Tests
   npm test -- --coverage
   
   Test runner: Jest
   Coverage target: >80%
```

### Frontend Testing

```
✅ Component Tests
   Location: src/components/__tests__/
   
   Test files:
   ├─ Login.test.jsx
   │  ├─ Renders form fields
   │  ├─ Form submission triggers action
   │  └─ Error messages display
   │
   └─ Messenger.test.jsx
      ├─ Renders chat window
      ├─ Friend list shows friends
      └─ Message input sends

✅ Redux Tests
   Location: src/redux/__tests__/
   
   Test files:
   ├─ slices/authSlice.test.js
   │  ├─ Login action sets token
   │  ├─ Logout clears state
   │  └─ Error sets error message
   │
   └─ thunks/authThunks.test.js
      ├─ Register thunk calls API
      ├─ Login thunk stores token
      └─ Errors handled correctly

✅ Testing Library
   - React Testing Library (user-centric)
   - Jest (test runner)
   - Mock API responses
   - Async/await handling
```

---

## 15. Deployment Guide

### Pre-Deployment Checklist

```
✅ Code Quality
   ├─ No console.log() statements (remove debugging)
   ├─ No commented-out code
   ├─ ESLint passing (npm run lint)
   ├─ Tests passing (npm test)
   ├─ No secrets hardcoded
   └─ No TODO comments

✅ Environment
   ├─ Create .env.production file
   ├─ Use strong JWT_SECRET
   ├─ MongoDB Atlas credentials secure
   ├─ Google OAuth credentials valid
   ├─ Cloudinary credentials working
   ├─ Email service configured
   └─ All env vars documented

✅ Frontend Build
   ├─ npm run build successful
   ├─ dist/ folder generated
   ├─ No build warnings
   ├─ API_BASE_URL set to production backend
   ├─ Socket.io URL set to production
   └─ Source maps disabled

✅ Backend Setup
   ├─ All dependencies installed
   ├─ Database indexes created
   ├─ Rate limiting enabled
   ├─ CORS origin set to frontend URL
   ├─ Logging configured
   └─ Error handling tested
```

### Deployment Platforms

#### Option 1: Heroku (Easiest for beginners)

```bash
# Backend Deployment
1. Install Heroku CLI
   brew install heroku

2. Login to Heroku
   heroku login

3. Create Heroku app
   heroku create your-chat-app-backend

4. Set environment variables
   heroku config:set JWT_SECRET=your_secret
   heroku config:set MONGO_URI=your_mongo_uri
   heroku config:set GOOGLE_CLIENT_ID=your_id
   # ... set all other env vars

5. Deploy
   git push heroku main

6. Check logs
   heroku logs --tail

# Frontend Deployment
1. Build the app
   npm run build

2. Deploy to Vercel (automatic)
   npm install -g vercel
   vercel

3. Set environment variables in Vercel dashboard
   VITE_API_URL=https://your-chat-app-backend.herokuapp.com

4. Frontend auto-deploys on git push
```

#### Option 2: Railway (Modern alternative)

```bash
# Backend & Frontend Deployment
1. Connect GitHub repo to Railway
2. Select project folder (backend)
3. Add MongoDB plugin (automatic)
4. Set environment variables
5. Auto-deploys on git push

# Custom Domain Setup
   1. Go to project settings
   2. Add custom domain
   3. Update DNS records with Railway nameservers
```

#### Option 3: AWS (Enterprise-grade)

```bash
# Backend (EC2 + RDS)
1. Create EC2 instance
2. Install Node.js
3. Clone repository
4. Install dependencies
5. Configure environment
6. Use PM2 for process management
   npm install -g pm2
   pm2 start server.js --name chat-app
   pm2 startup
   pm2 save

# Database (RDS - Managed MongoDB Atlas better)
1. Use MongoDB Atlas (hosted)
2. Configure security groups

# Frontend (S3 + CloudFront)
1. Build: npm run build
2. Upload dist/ to S3
3. Set CloudFront distribution
4. Configure custom domain
5. Add SSL certificate

# Monitoring
   - CloudWatch for logs
   - SNS for alerts
   - Auto-scaling for traffic spikes
```

### Post-Deployment

```
✅ Monitoring Setup
   ├─ Error tracking (Sentry)
   ├─ Performance monitoring (New Relic)
   ├─ Uptime monitoring (Better Stack)
   ├─ Database monitoring
   └─ Traffic analytics

✅ Logging & Debugging
   ├─ Centralized logs (ELK, Splunk)
   ├─ Error aggregation
   ├─ User session tracking
   ├─ Performance metrics
   └─ Request tracing

✅ Maintenance
   ├─ Regular backups (MongoDB Atlas auto)
   ├─ Security patches (npm audit)
   ├─ Dependency updates (npm update)
   ├─ Database optimization
   └─ Cost monitoring
```

---

## 16. Development Workflow

### Git Workflow

```
✅ Branch Strategy (Git Flow)
   ├─ main: Production-ready code
   ├─ develop: Integration branch
   ├─ feature/: Feature branches
   │  └─ feature/friend-request
   ├─ bugfix/: Bug fix branches
   │  └─ bugfix/message-status
   └─ release/: Release preparation
      └─ release/v1.0.0

✅ Commit Message Format
   [TYPE]: Description
   
   Types:
   ├─ feat: New feature
   │  Example: feat: add emoji picker to messages
   ├─ fix: Bug fix
   │  Example: fix: message not marking as read
   ├─ refactor: Code refactoring
   │  Example: refactor: extract validation logic
   ├─ docs: Documentation
   │  Example: docs: update API endpoints
   ├─ test: Tests
   │  Example: test: add auth service tests
   ├─ chore: Dependencies, setup
   │  Example: chore: update Express to 4.18
   └─ perf: Performance
      Example: perf: add message pagination

✅ Pull Request Process
   1. Create feature branch: git checkout -b feature/description
   2. Make changes & commit.

















   
   3. Push to GitHub: git push origin feature/description
   4. Create Pull Request on GitHub
   5. Code review by team members
   6. CI/CD pipeline runs tests
   7. Merge when approved & tests pass
   8. Delete feature branch
```

### Local Development Setup

```bash
# 1. Clone Repository
git clone https://github.com/username/Mern-Chat-App.git
cd Mern-Chat-App

# 2. Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with local settings

# 3. Start Backend
npm run dev
# Server running on http://localhost:5000

# 4. Frontend Setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with local settings

# 5. Start Frontend
npm run dev
# App running on http://localhost:5173

# 6. Access Application
# Open http://localhost:5173 in browser
```

### Development Tips

```
✅ Debugging
   ├─ Node.js debugger
   │  node --inspect server.js
   │  Chrome DevTools: chrome://inspect
   ├─ Redux DevTools extension (Chrome)
   ├─ React DevTools extension (Chrome)
   ├─ Network tab in DevTools for API calls
   └─ Console for frontend errors

✅ Hot Reload
   ├─ Backend: Nodemon auto-restarts on file change
   ├─ Frontend: Vite hot module replacement (instant reload)
   ├─ Preserve Redux state across reloads

✅ API Testing
   ├─ Postman: Test API endpoints
   ├─ Thunder Client: VS Code extension
   ├─ cURL: Command line testing
   │  curl -X POST http://localhost:5000/api/auth/login \
   │    -H "Content-Type: application/json" \
   │    -d '{"email":"user@example.com","password":"pass"}'
   └─ Mock mode for email: Check console logs

✅ Database Inspection
   ├─ MongoDB Compass: GUI client
   │  Connect to: mongodb+srv://user:pass@cluster.mongodb.net
   ├─ View: Collections, documents, indexes
   ├─ Query: Write MongoDB queries
   └─ Monitor: Performance metrics

✅ Real-time Debugging
   ├─ Socket.io client: chrome://extensions/
   │  Search: Socket.io devtools
   ├─ Monitor emitted events
   ├─ View payload data
   └─ Test event sending
```

---

## Summary: File Organization by Feature

### Feature: User Authentication

```
Models:
  └─ models/User.js (schema, methods, hooks)

Services:
  └─ services/authService.js (register, login, OAuth, verify)

Controllers:
  └─ controllers/authController.js (request handlers)

Routes:
  └─ routes/auth.js (endpoint definitions)

Middleware:
  ├─ middleware/authMiddleware.js (JWT verification)
  └─ middleware/validator.js (request validation)

Utils:
  ├─ utils/tokenUtil.js (JWT operations)
  ├─ utils/hashUtil.js (password hashing)
  ├─ utils/validators.js (Joi schemas)
  └─ services/emailService.js (email sending)

Frontend:
  ├─ components/auth/Login.jsx
  ├─ components/auth/Register.jsx
  ├─ components/auth/OAuthButton.jsx
  ├─ redux/slices/authSlice.js
  ├─ redux/thunks/authThunks.js
  ├─ services/authService.js (API calls)
  └─ hooks/useAuth.js
```

### Feature: Real-time Messaging

```
Models:
  ├─ models/Message.js
  └─ models/Conversation.js

Services:
  └─ services/messageService.js

Controllers:
  └─ controllers/messageController.js

Routes:
  └─ routes/message.js

Socket.io:
  └─ socket/socketHandler.js (Observer pattern)

Frontend:
  ├─ components/messenger/ChatWindow.jsx
  ├─ components/messenger/MessageItem.jsx
  ├─ components/messenger/MessageInput.jsx
  ├─ redux/slices/messageSlice.js
  ├─ redux/thunks/messageThunks.js
  ├─ services/messageService.js
  ├─ services/socketService.js
  └─ hooks/useMessage.js
```

### Feature: Friend Management

```
Models:
  └─ models/User.js (friends array)

Services:
  └─ services/userService.js (friend operations)

Controllers:
  └─ controllers/userController.js

Routes:
  └─ routes/user.js

Frontend:
  ├─ components/messenger/FriendList.jsx
  ├─ redux/slices/friendSlice.js
  ├─ redux/thunks/userThunks.js
  └─ hooks/useUser.js
```

---

## Conclusion

This MERN Chat Application demonstrates:

✅ **Senior-Level Architecture**
- Clear separation of concerns (Controllers → Services → Models)
- Design patterns (Singleton, Factory, Repository, Observer, Middleware)
- SOLID principles throughout

✅ **Production-Ready Security**
- JWT authentication with OAuth 2.0
- Password hashing with bcryptjs
- Input validation and sanitization
- Rate limiting and CORS
- Environment variable management

✅ **Scalable Design**
- Database indexing and optimization
- Socket.io for real-time features
- Middleware architecture
- Error handling strategy
- Logging throughout

✅ **Best Practices**
- Clean code organization
- Comprehensive API documentation
- Error handling and validation
- Testing strategy
- Deployment procedures

This codebase is ready for:
- Portfolio showcase
- Production deployment
- Team collaboration
- Further enhancements
- Learning and reference

---

## Next Steps

Continue with development batches:
1. ✅ Batch 1-2: Configuration & Database
2. ✅ Batch 3-6: Utils, Middleware, Models, Services
3. ⏳ Batch 7: Controllers & Routes
4. ⏳ Batch 8: Socket.io & Real-time
5. ⏳ Batch 9: Frontend Foundation & Auth UI
6. ⏳ Batch 10: Redux & State Management
7. ⏳ Batch 11: Messenger UI & Components
8. ⏳ Batch 12: Testing & Deployment

---

**Last Updated**: January 2026  
**Status**: Architecture & Guidelines Complete  
**Next**: Implement Controllers & Routes (Batch 7)
