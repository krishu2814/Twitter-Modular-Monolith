# 🐦 Twitter Modular Monolith Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/RabbitMQ-AMQP-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Tests-128%20Passing%20(100%25)-brightgreen?style=for-the-badge&logo=jest&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/Architecture-Clean%204--Layer-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

<p align="center">
  A production-grade, event-driven <strong>Twitter / X Backend Engine</strong> architected as a high-performance <strong>Modular Monolith</strong> in <strong>Node.js</strong> and <strong>Express</strong>, powered by <strong>MongoDB (ACID Multi-Document Transactions)</strong>, <strong>RabbitMQ (AMQP Asynchronous Event Broker)</strong>, and <strong>Socket.io (Real-Time Bidirectional WebSockets)</strong>.
</p>

---

## 📑 Table of Contents

- [🏛️ System Architecture](#️-system-architecture)
- [⚡ Key Architectural Pillars](#-key-architectural-pillars)
- [📦 Domain Modules (18 Modules)](#-domain-modules-18-modules)
- [📡 Complete API Reference (48+ Endpoints)](#-complete-api-reference-48-endpoints)
- [⚡ Real-Time WebSocket Gateway (Socket.io)](#-real-time-websocket-gateway-socketio)
- [📂 Clean Project Structure](#-clean-project-structure)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🧪 Automated Test Suite (128 Tests / 100% Pass)](#-automated-test-suite-128-tests--100-pass)
- [💡 Engineering Trade-offs & Design Decisions](#-engineering-trade-offs--design-decisions)
- [📄 License](#-license)

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |         HTTP / WebSocket Server       |
                                  |         (Express.js + Socket.io)      |
                                  +-------------------+-------------------+
                                                      |
                     +--------------------------------+--------------------------------+
                     |                                                                 |
          +----------v----------+                                           +----------v----------+
          |   REST API Routes   |                                           |  Socket.io Gateway  |
          |      /api/v1/*      |                                           | (JWT Authenticated) |
          +----------+----------+                                           +----------+----------+
                     |                                                                 |
          +----------v----------+                                                      | (Private User Rooms:
          |     Controllers     |                                                      |  `user:<userId>`)
          +----------+----------+                                                      |
                     |                                                                 |
          +----------v----------+                                                      |
          |    Service Layer    | ------------- (Real-Time Live DMs) ----------------->+
          | (Business Logic &Tx)|                                                      |
          +-----+---------+-----+                                                      |
                |         |                                                            |
     +----------+         +----------+                                                 |
     |                               |                                                 |
+----v-----------------+   +---------v------------+                                    |
|     Repositories     |   |   RabbitMQ Producer  |                                    |
|  (Mongoose Schemas)  |   |  (Exchange: NOTIFY)  |                                    |
+----------+-----------+   +---------+------------+                                    |
           |                         |                                                 |
+----------v-----------+   +---------v------------+                                    |
|   MongoDB Database   |   |   RabbitMQ Message   |                                    |
| (ACID Transactions)  |   |        Broker        |                                    |
+----------------------+   +---------+------------+                                    |
                                     |                                                 |
                                     v (channel.consume)                               |
                           +----------------------+                                    |
                           | Notification Consumer| ---- (Live Push Notifications) ---->+
                           | (Background Worker)  |
                           +----------------------+
```

---

## ⚡ Key Architectural Pillars

### 1. 🧱 4-Layer Clean Modular Architecture
Enforces strict unidirectional domain isolation across 18 self-contained feature modules:
$$\text{Routes} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Repositories} \longrightarrow \text{Models}$$
* **Routes**: HTTP method routing, URI parameter binding, and authentication/authorization middleware.
* **Controllers**: Request payload validation, response code formatting (`200`, `201`, `400`, `403`, `404`, `500`), and delegation.
* **Services**: Core business logic, data sanitization, orchestration, hashtag/mention extraction, and transaction boundary management.
* **Repositories**: Abstracted data access layer with optimized Mongoose queries, population pipelines, and projection indexing.

### 2. 🛡️ Multi-Document ACID Transactions
Leverages MongoDB Replica Sets (`mongoose.startSession()`) to ensure absolute data integrity for distributed multi-entity state transitions:
* **Follow / Unfollow**: Atomically writes `Follow` documents while synchronizing `followersCount` and `followingCount` on both user profiles.
* **Likes & Retweets**: Atomically creates/removes engagement records and updates tweet engagement counters (`likesCount`, `retweetsCount`).
* **Blocks & Mutual Severing**: Atomically creates `Block` records and severs existing mutual follow relationships.
* **Multi-Tweet Threads**: Atomically publishes 2–10 connected tweets in a single transaction rollback boundary.

### 3. 📬 Decoupled Asynchronous Event Pipeline (RabbitMQ)
Decouples critical write paths from secondary notification fan-out via an AMQP message broker:
* **Exchange**: `NOTIFICATION` (Direct exchange, durable).
* **Routing Key**: `NOTIFY`.
* **Event Stream**: Publishes events for `LIKE`, `RETWEET`, `FOLLOW`, `COMMENT`, `MENTION`, and `MESSAGE`.
* **Worker Consumer**: Dedicated background consumer process parses event buffers, creates database records, calculates unread counts, and pushes real-time WebSocket alerts.

### 4. ⚡ Real-Time WebSocket Gateway (Socket.io)
Integrated WebSocket server operating concurrently with Express HTTP endpoints on the same port:
* **JWT Handshake Authentication**: Validates tokens during initial socket handshake; rejects unauthenticated clients with `401`.
* **Private User Rooms**: Automatically joins connected users to isolated rooms (`user:<userId>`).
* **Instant Direct Messaging**: Pushes live direct messages (`message:received`) to recipients and synchronizes multi-tab sender sessions (`message:sent`).
* **Live Typing Indicators**: Relays `typing:start` and `typing:stop` status alerts between conversation participants.
* **Real-Time Read Receipts**: Broadcasts `message:read_receipt` to senders when messages are marked as read.
* **Active Presence Engine**: In-memory connection tracking broadcasts `user:online` and `user:offline` events with `lastSeen` timestamps.
* **Live In-App Push Notifications**: Streams notifications directly from the RabbitMQ consumer to the user's socket room.

### 5. 🧵 Multi-Tweet Threads & Edit Grace Window
* **Atomic Thread Publishing (`POST /tweets/thread`)**: Publishes 2–10 chained tweets atomically, linking `parentTweet` and `threadHead` references.
* **Sequential Chain Traversal (`GET /tweets/:id/thread`)**: Resolves full chronological conversation chains when queried from any node (root, middle, or leaf).
* **Tweet Editing & 30-Minute Grace Window (`PATCH /tweets/:id/edit`)**: Author-only edit window strictly enforced server-side (`diffMinutes <= 30`), preserving historical content snapshots in `editHistory` and re-indexing hashtags and `@mentions`.

### 6. 🧠 Graph-Based Social Discovery ("Who to Follow")
* Implements a **2nd-degree friend-of-friends network traversal algorithm** (`GET /users/recommendations/who-to-follow`).
* Analyzes candidate intersections among accounts followed by the user's direct connections.
* Ranks candidates by mutual friend frequency, excluding self, existing followings, and blocked accounts, with popularity backfills.

### 7. 📰 Curated Multi-Timeline Feeds
* **Home Feed (`GET /feeds`)**: Aggregates top-level tweets and quote tweets from followed creators, applying stealth block and mute suppression while cleanly isolating thread continuation fragments.
* **Verified Feed (`GET /feeds/verified`)**: High-signal curated feed exclusively featuring tweets authored by verified creators (`isVerified: true`).
* **List Feed (`GET /lists/:id/tweets`)**: Dedicated timeline composed exclusively of selected List members.

---

## 📦 Domain Modules (18 Modules)

| # | Domain Module | Key Responsibilities | Architectural Layers |
|---|---|---|---|
| 1 | **Auth** | User registration, bcrypt password hashing, JWT token authentication, login validation | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 2 | **User** | Profile fetching, bio updates, verification badges (`BLUE`/`GOLD`/`OFFICIAL`), graph recommendations, online presence | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 3 | **Tweet** | Tweet publishing, multi-tweet threads (2–10 chain), 30-min edit grace window, polls, quote tweets, impressions analytics | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 4 | **Like** | Toggle tweet likes with ACID transaction + RabbitMQ `LIKE` event notification | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 5 | **Retweet** | Toggle retweets with ACID transaction + RabbitMQ `RETWEET` event notification | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 6 | **Bookmark** | Private bookmarks with ACID transaction, saved tweets list, and custom Folders/Collections | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 7 | **Comment** | Top-level comments and nested replies, cascade deletion, `COMMENT` and `MENTION` event notifications | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 8 | **Follow** | Follow/unfollow toggle with atomic counter updates, self-follow guard, followers list | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 9 | **Hashtag** | Hashtag normalization, indexing, trending aggregation, and querying tweets by hashtag | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 10 | **Feed** | Fan-out timeline generation (Home Feed & Verified Creator Feed) with stealth mute/block suppression | Controller $\to$ Service $\to$ Repository |
| 11 | **Search** | Case-insensitive keyword search for tweets and users with pagination | Controller $\to$ Service $\to$ Repository |
| 12 | **Message** | 1-on-1 Direct Messaging (DMs), conversation history, real-time WebSocket delivery, and read receipts | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 13 | **Block** | User blocking/unblocking with ACID transaction, auto-unfollow, DM & feed exclusion | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 14 | **Mute** | Stealth muting/unmuting of users with automatic feed timeline suppression | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 15 | **List** | Twitter Lists creation, member management, privacy controls, and dedicated member feeds | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 16 | **ScheduledTweet** | Future tweet scheduling, cancellation, status lifecycle, and background auto-publishing | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 17 | **Report** | Content moderation, violation reporting (SPAM, HARASSMENT, etc.), auto-flagging, and admin actioning | Controller $\to$ Service $\to$ Repository $\to$ Model |
| 18 | **Notification** | Async consumption from RabbitMQ, live WebSocket push, mark single/all notifications as read | Controller $\to$ Service $\to$ Repository $\to$ Model |

---

## 📡 Complete API Reference (48+ Endpoints)

### 🔐 Authentication & User Management
```http
POST   /api/v1/auth/signup                    # Register account (userName, email, password)
POST   /api/v1/auth/signin                    # Authenticate and receive JWT token
GET    /api/v1/users                          # List all users (Authenticated)
GET    /api/v1/users/recommendations/who-to-follow # Graph-based Who to Follow suggestions
GET    /api/v1/users/:id                      # Get user profile by ID (Populates badges, pinned tweet)
GET    /api/v1/users/:id/presence             # Get real-time online status and lastSeen timestamp
PATCH  /api/v1/users/:id/verify               # Update verification badge (BLUE / GOLD / OFFICIAL)
PATCH  /api/v1/users/:id                      # Update bio / profile (Owner only)
DELETE /api/v1/users/:id                      # Delete user account (Owner only)
```

### ✍️ Tweets, Threads, Polls & Analytics
```http
POST   /api/v1/tweets/create                  # Post tweet (hashtags, mentions, media, quotes, polls)
POST   /api/v1/tweets/thread                  # Atomically publish 2-10 tweet thread (ACID)
GET    /api/v1/tweets/:id/thread              # Fetch full sequential parent-child thread chain
PATCH  /api/v1/tweets/:id/edit                # Edit tweet within 30-min window (Audit snapshot)
GET    /api/v1/tweets/get/:id                 # Get single tweet by ID
GET    /api/v1/tweets/get                     # Get all public tweets
GET    /api/v1/tweets/user/:userId            # Get tweets authored by user
POST   /api/v1/tweets/:id/poll/vote           # Vote on poll option (Single-vote guarded)
POST   /api/v1/tweets/:id/view                # Record impression view count
GET    /api/v1/tweets/:id/analytics           # Get views, engagements, and engagement rate
POST   /api/v1/tweets/pin/:id                 # Pin tweet to user profile
POST   /api/v1/tweets/unpin                   # Unpin tweet from user profile
PATCH  /api/v1/tweets/update/:id              # Update tweet content (Author only)
DELETE /api/v1/tweets/delete/:id              # Delete tweet (Author only)
```

### ❤️ Likes, 🔁 Retweets & 🔖 Bookmarks & Folders
```http
POST   /api/v1/likes/:tweetId                 # Toggle like/unlike (ACID + RabbitMQ event)
POST   /api/v1/retweets/:tweetId              # Toggle retweet/unretweet (ACID + RabbitMQ event)
GET    /api/v1/retweets/tweet/:tweetId        # List users who retweeted a tweet
GET    /api/v1/retweets/user/:userId          # List tweets retweeted by a user
POST   /api/v1/bookmarks/:tweetId             # Toggle private tweet bookmark (ACID)
GET    /api/v1/bookmarks                      # List my bookmarked tweets (Paginated)
POST   /api/v1/bookmarks/folders              # Create bookmark folder (name, icon, color)
GET    /api/v1/bookmarks/folders              # List my bookmark folders
GET    /api/v1/bookmarks/folders/:folderId    # Get bookmark folder details
PATCH  /api/v1/bookmarks/folders/:folderId    # Update folder details
DELETE /api/v1/bookmarks/folders/:folderId    # Delete folder (Owner only)
POST   /api/v1/bookmarks/folders/:folderId/tweets/:tweetId   # Add tweet to bookmark folder
DELETE /api/v1/bookmarks/folders/:folderId/tweets/:tweetId   # Remove tweet from folder
GET    /api/v1/bookmarks/folders/:folderId/tweets            # List tweets in bookmark folder
```

### 👥 Follows & Multi-Timeline Feeds
```http
POST   /api/v1/follows/toggle/:id             # Follow / unfollow user (ACID + Event)
GET    /api/v1/follows/followers              # List my followers
GET    /api/v1/follows/following              # List users I follow
GET    /api/v1/feeds                          # Chronological home timeline (Mute/block filtered)
GET    /api/v1/feeds/verified                 # Timeline exclusively featuring verified creators
```

### 💬 Threaded Comments & Replies
```http
POST   /api/v1/comments/tweet/:tweetId        # Create comment or threaded reply
GET    /api/v1/comments/tweet/:tweetId        # List top-level comments for tweet
GET    /api/v1/comments/:commentId/replies    # List nested replies for a comment
DELETE /api/v1/comments/:commentId            # Delete comment (Cascade delete child replies)
```

### ✉️ Direct Messaging (DMs)
```http
POST   /api/v1/messages/send                  # Send 1-on-1 direct message (REST + Live Socket push)
GET    /api/v1/messages/conversations         # List recent conversations with latest message
GET    /api/v1/messages/conversation/:userId  # Get chat history with a contact
PATCH  /api/v1/messages/:messageId/read       # Mark message as read (Live read receipt)
```

### 🏷️ Hashtags & 🔍 Keyword Search
```http
GET    /api/v1/hashtags/trending              # List top trending hashtags
GET    /api/v1/hashtags/:title                # List tweets tagged with hashtag
GET    /api/v1/search/tweets?q=nodejs         # Search tweets by keyword (Paginated)
GET    /api/v1/search/users?q=alice           # Search users by username or bio
```

### ⏱️ Scheduled Tweets & 🚩 Moderation Reports
```http
POST   /api/v1/scheduled-tweets               # Schedule tweet for future publishing
GET    /api/v1/scheduled-tweets/me            # List my scheduled tweets
DELETE /api/v1/scheduled-tweets/:id           # Cancel scheduled tweet
POST   /api/v1/scheduled-tweets/process-due   # Background auto-publisher execution endpoint
POST   /api/v1/reports/tweets/:tweetId        # Submit tweet violation report
GET    /api/v1/reports?status=PENDING         # List moderation queue reports
GET    /api/v1/reports/:id                    # Get report details with populated reporter
PATCH  /api/v1/reports/:id/action             # Moderate report (TWEET_HIDDEN / TWEET_DELETED)
```

### 🚫 Blocks, 🔇 Mutes & 📋 Lists
```http
POST   /api/v1/blocks/toggle/:userId          # Block/unblock user (ACID + Mutual auto-unfollow)
GET    /api/v1/blocks                         # List blocked users
POST   /api/v1/mutes/toggle/:userId           # Stealth mute/unmute user
GET    /api/v1/mutes                          # List muted users
POST   /api/v1/lists                          # Create Twitter List
GET    /api/v1/lists/user/me                  # List my created lists
GET    /api/v1/lists/:id                      # Get list details & members
PATCH  /api/v1/lists/:id                      # Update list details
DELETE /api/v1/lists/:id                      # Delete list
POST   /api/v1/lists/:id/members/:userId      # Add member to list
DELETE /api/v1/lists/:id/members/:userId      # Remove member from list
GET    /api/v1/lists/:id/tweets               # Get curated timeline feed of list members
```

---

## ⚡ Real-Time WebSocket Gateway (Socket.io)

**Connection URL**: `ws://127.0.0.1:6000`  
**Authentication**: Passed during handshake via `{ auth: { token: "<JWT_TOKEN>" } }` or `Authorization` header.

### 📡 WebSocket Event Catalog

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `user:online` | Server $\to$ Broadcast | `{ userId, userName, isOnline: true }` | Broadcasted across network when user connects |
| `user:offline` | Server $\to$ Broadcast | `{ userId, userName, isOnline: false, lastSeen }` | Broadcasted when user's last connection closes |
| `dm:send` | Client $\to$ Server | `{ receiverId, content }` | Send a direct message directly over WebSocket |
| `message:received` | Server $\to$ Client (`user:<receiverId>`) | `{ _id, sender, content, ... }` | Instant real-time message delivery |
| `message:sent` | Server $\to$ Client (`user:<senderId>`) | `{ _id, receiver, content, ... }` | Multi-tab sender synchronization |
| `typing:start` | Client $\to$ Server | `{ receiverId }` | User started typing in chat |
| `typing:started` | Server $\to$ Client (`user:<receiverId>`) | `{ senderId, userName }` | Real-time typing status alert |
| `typing:stop` | Client $\to$ Server | `{ receiverId }` | User stopped typing in chat |
| `typing:stopped` | Server $\to$ Client (`user:<receiverId>`) | `{ senderId }` | Real-time typing status clear |
| `message:read` | Client $\to$ Server | `{ messageId, senderId }` | Mark message as read |
| `message:read_receipt` | Server $\to$ Client (`user:<senderId>`) | `{ messageId, readBy, readAt }` | Instant read receipt notification |
| `notification:received`| Server $\to$ Client (`user:<targetId>`) | `{ notification, unreadCount }` | Real-time push notification streamed from RabbitMQ worker |
| `presence:query` | Client $\to$ Server | `{ userIds: [...] }` | Batch query online presence states |

---

## 📂 Clean Project Structure

```
twitter-modular-monolith/
├── docker-compose.yml              # Local container stack (MongoDB Replica Set & RabbitMQ)
├── package.json                    # Dependencies and npm test / start scripts
├── README.md                       # Master technical architecture & API reference
├── src/
│   ├── app.js                      # Express application configuration & v1 routing
│   ├── server.js                   # HTTP + Socket.io Server bootstrap & queue startup
│   ├── api/
│   │   └── v1/                     # Modular API Route Controllers
│   │       ├── index.js            # Centralized API v1 route aggregator (18 domains)
│   │       ├── auth-routes.js
│   │       ├── user-routes.js
│   │       ├── tweet-routes.js
│   │       ├── like-routes.js
│   │       ├── retweet-routes.js
│   │       ├── bookmark-routes.js
│   │       ├── follow-routes.js
│   │       ├── comment-routes.js
│   │       ├── hashtag-routes.js
│   │       ├── feed-routes.js
│   │       ├── notification-routes.js
│   │       ├── search-routes.js
│   │       ├── message-routes.js
│   │       ├── block-routes.js
│   │       ├── mute-routes.js
│   │       ├── list-routes.js
│   │       ├── scheduled-tweet-routes.js
│   │       └── report-routes.js
│   ├── config/                     # Configuration constants & connection managers
│   │   ├── database.js             # Mongoose MongoDB connection
│   │   ├── rabbitmq.js             # RabbitMQ AMQP channel manager
│   │   └── serverConfig.js         # Environment configuration loader
│   ├── middlewares/
│   │   └── auth-middleware.js      # JWT authentication middleware
│   ├── modules/                    # 18 Isolated Domain Modules (Service/Repo/Model)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── tweet/
│   │   ├── like/
│   │   ├── retweet/
│   │   ├── bookmark/
│   │   ├── follow/
│   │   ├── comment/
│   │   ├── hashtag/
│   │   ├── feed/
│   │   ├── search/
│   │   ├── message/
│   │   ├── block/
│   │   ├── mute/
│   │   ├── list/
│   │   ├── scheduled/
│   │   ├── report/
│   │   └── notification/
│   └── utils/                      # Shared utility services & brokers
│       ├── message-queue.js        # AMQP connection and channel assert
│       ├── producer.js             # Notification event publisher
│       └── socket-server.js        # Socket.io gateway & presence manager
└── scratch/
    └── run-tests.js                # Exhaustive end-to-end integration test runner
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (v6.0+ configured as a single-node replica set for ACID transactions)
* **RabbitMQ** (v3.10+ with AMQP on port 5672)

### 2. Launch Local Infrastructure (Docker Compose)
```bash
docker compose up -d
```
Spins up:
* **MongoDB (Replica Set `rs0`)**: `localhost:27017`
* **RabbitMQ Message Broker**: `localhost:5672` (Management UI: `http://localhost:15672`)

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=6000
MONGO_URL=mongodb://127.0.0.1:27017/twitter?directConnection=true
SECRET_TOKEN=super_secret_jwt_key_2026
EXPIRES_IN=7d
SALT_ROUNDS=10
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=NOTIFICATION
RABBITMQ_QUEUE=notification-queue
RABBITMQ_ROUTING_KEY=NOTIFY
```

### 4. Install Dependencies & Start Server
```bash
# Install dependencies
npm install

# Start development server
npm start
```

---

## 🧪 Automated Test Suite (128 Tests / 100% Pass)

Execute the full end-to-end integration test suite covering all 18 modules, ACID transactions, and WebSocket events:

```bash
npm test
```

```text
================================================================
🚀 EXHAUSTIVE TWITTER MODULAR MONOLITH TEST SUITE (18 MODULES + WEBSOCKETS)
================================================================

--- [Suite 1] Authentication & User Management (10/10) ✅
--- [Suite 2] Standalone Tweets, Polls, Pinning & Analytics (8/8) ✅
--- [Suite 3] 🧵 Multi-Tweet Threads Creation (10/10) ✅
--- [Suite 4] 🧵 Sequential Thread Traversal (6/6) ✅
--- [Suite 5] ✏️ Tweet Editing & 30-Minute Grace Window (8/8) ✅
--- [Suite 6] Likes, Retweets & ACID Transactions (6/6) ✅
--- [Suite 7] Bookmarks & Bookmark Folders (6/6) ✅
--- [Suite 8] Follows & Graph Recommendations (4/4) ✅
--- [Suite 9] Comments & Threaded Discussion Trees (5/5) ✅
--- [Suite 10] Hashtags & Keyword Search (4/4) ✅
--- [Suite 11] Direct Messaging (DMs) (5/5) ✅
--- [Suite 12] Lists & Curated Feeds (6/6) ✅
--- [Suite 13] Scheduled Tweets & Auto-Publisher (3/3) ✅
--- [Suite 14] Content Moderation & Reports (4/4) ✅
--- [Suite 15] Blocks & Stealth Mutes (5/5) ✅
--- [Suite 16] Multi-Timeline Feeds & Stealth Suppression (6/6) ✅
--- [Suite 17] Async Notifications & RabbitMQ Worker (4/4) ✅
--- [Suite 18] ⚡ Real-Time WebSockets & Push Notifications (13/13) ✅
--- [Suite 19] Cleanup & Deletion Lifecycles (4/4) ✅

================================================================
📊 FINAL TEST REPORT: 128 PASSED, 0 FAILED (100% SUCCESS)
================================================================
```

---

## 💡 Engineering Trade-offs & Design Decisions

### 1. Modular Monolith vs. Microservices
* **Zero Network Latency**: Cross-domain interactions (e.g. Feed querying Follow and Block repositories) execute in-process within nanoseconds rather than incurring serialized gRPC/HTTP overhead.
* **Single Deployment Artifact**: Greatly reduces infrastructure complexity, distributed tracing overhead, and operational cost while maintaining strict domain encapsulation.

### 2. RabbitMQ Direct Exchange vs. Redis Pub/Sub
* **Message Durability**: RabbitMQ guarantees durable queues with message acknowledgments (`noAck: false`), ensuring notification events survive unexpected worker crashes.
* **Flow Control**: RabbitMQ handles queue backpressure gracefully during heavy fan-out spikes.

### 3. Dual REST + WebSocket Ingestion
* **High Availability**: Clients can send messages either via standard REST endpoints or over established WebSockets without coupling the client implementation to a single protocol.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
