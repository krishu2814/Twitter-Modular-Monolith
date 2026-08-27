# 🐦 Twitter Modular Monolith Backend

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg?logo=mongodb)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-orange.svg?logo=rabbitmq)](https://www.rabbitmq.com/)
[![Tests](https://img.shields.io/badge/Tests-114%20Passing%20(100%25)-success.svg)](https://github.com/krishu2814/Twitter-Modular-Monolith)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, event-driven **Twitter backend** engineered as a **Modular Monolith** using **Node.js**, **Express**, **MongoDB (ACID Transactions)**, and **RabbitMQ (AMQP Message Broker)**.

---

## 🏛️ System Architecture

```
                                  +-----------------------+
                                  |     Express Router    |
                                  |       /api/v1/*       |
                                  +-----------+-----------+
                                              |
                                  +-----------v-----------+
                                  |      Controllers      |
                                  +-----------+-----------+
                                              |
                                  +-----------v-----------+
                                  |    Service Layer      |
                                  | (Business Logic & Tx) |
                                  +-----+-----------+-----+
                                        |           |
                      +-----------------+           +-----------------+
                      |                                               |
           +----------v----------+                         +----------v----------+
           |  Repositories       |                         |  RabbitMQ Producer  |
           |  (Mongoose Models)  |                         |  (Exchange: NOTIFY) |
           +----------+----------+                         +----------+----------+
                      |                                               |
           +----------v----------+                         +----------v----------+
           |       MongoDB       |                         |    RabbitMQ Broker  |
           | (ACID Transactions) |                         +----------+----------+
           +---------------------+                                    |
                                                           +----------v----------+
                                                           | NotificationConsumer|
                                                           | (Background Worker) |
                                                           +---------------------+
```

### ⚡ Key Architectural Highlights:
* **4-Layer Clean Architecture**: Domain isolation enforcing `Routes` $\to$ `Controllers` $\to$ `Services` $\to$ `Repositories` $\to$ `Models`.
* **Multi-Document ACID Transactions**: Distributed concurrency control for Follows, Likes, Retweets, Bookmarks, and Mutual Block Severing via `mongoose.startSession()`.
* **Event-Driven Asynchronous Processing**: Decoupled message broker via **RabbitMQ** for 6 event types (`LIKE`, `RETWEET`, `FOLLOW`, `COMMENT`, `MENTION`, `MESSAGE`) with dedicated worker consumers.
* **Graph-Based Social Discovery**: 2nd-degree network recommendation algorithm (*"Who to Follow"*) ranking candidates by mutual connections with popularity backfills.
* **Multi-Tweet Threads & Chain Traversal**: Atomic publishing of 2–10 linked tweets in a single transaction with parent-child pointer chain indexing and sequential traversal from any thread node.
* **Tweet Editing & Grace Window**: 30-minute server-enforced edit window with complete historical content snapshot preservation (`editHistory: [...]`) and dynamic hashtag/mention re-indexing.
* **Curated Multi-Timeline Feeds**:
  * **Home Feed**: Fan-out timeline aggregating tweets and thread roots with stealth mute & block suppression.
  * **Verified Feed**: Filtered timeline exclusively showcasing tweets by verified creators (`isVerified: true`).
  * **List Feed**: Dedicated feeds composed strictly of selected list members.
* **Scheduled Tweets & Auto-Publisher**: Future tweet scheduling engine with automated background execution to live feeds.
* **Bookmark Collections & Folders**: Organized private saved tweets with custom colors, icons, and metadata.
* **Interactive Tweet Polls**: Multi-option voting polls with single-vote enforcement, real-time percentages, and expiration limits.
* **Content Moderation & Auto-Flagging**: User reporting lifecycle with automated threshold flagging ($\ge 3$ reports) and administrator take-down actions.
* **Threaded Discussions**: Parent-child comment trees with recursive cascade deletion and atomic counter synchronization.
* **Direct Messaging (DMs)**: 1-on-1 private messaging with conversation grouping and read receipts (`PATCH /:id/read`).

---

## 📦 Domain Modules (18 Distinct Modules)

| Module | Responsibilities |
|---|---|
| **Auth** | User registration, bcrypt password hashing, JWT token authentication, login validation |
| **User** | User profile fetching, bio updates, verification badges (`BLUE`/`GOLD`/`OFFICIAL`), graph recommendations |
| **Tweet** | Tweet creation, multi-tweet threads (2-10 chain), 30-min edit grace window, polls, quotes, pinning, impressions analytics |
| **Like** | Toggle tweet likes with ACID transaction + RabbitMQ `LIKE` event notification |
| **Retweet** | Toggle retweets with ACID transaction + RabbitMQ `RETWEET` event notification |
| **Bookmark** | Private tweet bookmarks with ACID transaction, saved list, and custom Folders/Collections |
| **Comment** | Top-level comments and nested replies, cascade deletion, `COMMENT` and `MENTION` event notifications |
| **Follow** | Follow/unfollow toggle with atomic counter updates, self-follow guard, followers list |
| **Hashtag** | Hashtag normalization, indexing, trending aggregation, and querying tweets by hashtag |
| **Feed** | Fan-out timeline generation (Home Feed & Verified Creator Feed) with stealth mute/block suppression |
| **Search** | Case-insensitive keyword search for tweets and users with pagination |
| **Message** | 1-on-1 Direct Messaging (DMs), conversation history, and read status |
| **Block** | User blocking/unblocking with ACID transaction, auto-unfollow, DM & feed exclusion |
| **Mute** | Stealth muting/unmuting of users with automatic feed timeline suppression |
| **List** | Twitter Lists creation, member management, privacy controls, and dedicated member feeds |
| **ScheduledTweet** | Future tweet scheduling, cancellation, status lifecycle, and background auto-publishing |
| **Report** | Content moderation, violation reporting (SPAM, HARASSMENT, etc.), auto-flagging, and admin actioning |
| **Notification** | Async consumption from RabbitMQ, mark single/all notifications as read |

---

## 📡 API Reference (48+ Endpoints)

### 🔐 Authentication & Users
* `POST /api/v1/auth/signup` — Register a new account (`userName`, `email`, `password`)
* `POST /api/v1/auth/signin` — Login and receive JWT (`email`, `password`)
* `GET /api/v1/users` — List all users
* `GET /api/v1/users/recommendations/who-to-follow` — Graph-based "Who to Follow" recommendations (Friends-of-friends algorithm)
* `GET /api/v1/users/:id` — Get user profile by ID (Populates `pinnedTweet`, `isVerified`, `badgeType`)
* `PATCH /api/v1/users/:id/verify` — Update verification status & badge (`isVerified: true`, `badgeType: "BLUE" | "GOLD" | "OFFICIAL"`)
* `PATCH /api/v1/users/:id` — Update bio/profile (Authorized)
* `DELETE /api/v1/users/:id` — Delete user account (Authorized)

### ✍️ Tweets, Multi-Tweet Threads, Quotes, Polls & Analytics
* `POST /api/v1/tweets/create` — Post a new tweet (Supports `#hashtags`, `@mentions`, `media: []`, `quoteTweet: "id"` & `poll: { options: [] }`)
* `POST /api/v1/tweets/thread` — Publish a multi-tweet thread atomically (2–10 connected tweets, transaction-protected)
* `GET /api/v1/tweets/:id/thread` — Fetch the complete parent-to-child conversational chain ordered sequentially
* `PATCH /api/v1/tweets/:id/edit` — Edit tweet content & media within 30-minute grace window (Preserves `editHistory` audit trail)
* `GET /api/v1/tweets/get/:id` — Get single tweet with author, quoted tweet, and poll details
* `GET /api/v1/tweets/get` — Get all tweets
* `GET /api/v1/tweets/user/:userId` — Get tweets authored by a specific user (Includes `pinnedTweet`)
* `POST /api/v1/tweets/:id/poll/vote` — Vote on a tweet poll (`optionIndex: 0`)
* `POST /api/v1/tweets/:id/view` — Record a view impression on a tweet
* `GET /api/v1/tweets/:id/analytics` — Get tweet views, total engagements, and engagement rate (Author only)
* `POST /api/v1/tweets/pin/:id` — Pin a tweet to user profile (Author only)
* `POST /api/v1/tweets/unpin` — Unpin current pinned tweet (Author only)
* `PATCH /api/v1/tweets/update/:id` — Update tweet content (Author only)
* `DELETE /api/v1/tweets/delete/:id` — Delete tweet (Author only)

### ⏱️ Scheduled Tweets
* `POST /api/v1/scheduled-tweets` — Schedule a new tweet (`content`, `scheduledFor`, `media`)
* `GET /api/v1/scheduled-tweets/me` — Get all scheduled tweets by the authenticated user
* `DELETE /api/v1/scheduled-tweets/:id` — Cancel a scheduled tweet (Author only)
* `POST /api/v1/scheduled-tweets/process-due` — Process and publish all due scheduled tweets

### ❤️ Likes, 🔁 Retweets & 🔖 Bookmarks & Folders
* `POST /api/v1/likes/:tweetId` — Toggle like/unlike (ACID Transaction + Event)
* `POST /api/v1/retweets/:tweetId` — Toggle retweet/unretweet (ACID Transaction + Event)
* `GET /api/v1/retweets/tweet/:tweetId` — Get users who retweeted a tweet
* `GET /api/v1/retweets/user/:userId` — Get tweets retweeted by a user
* `POST /api/v1/bookmarks/:tweetId` — Toggle bookmark (Private)
* `GET /api/v1/bookmarks` — List my bookmarked tweets (Paginated)
* `POST /api/v1/bookmarks/folders` — Create a new bookmark folder (`name`, `description`, `icon`, `color`)
* `GET /api/v1/bookmarks/folders` — List all bookmark folders owned by user
* `GET /api/v1/bookmarks/folders/:folderId` — Get folder details
* `PATCH /api/v1/bookmarks/folders/:folderId` — Update folder details
* `DELETE /api/v1/bookmarks/folders/:folderId` — Delete bookmark folder (Owner only)
* `POST /api/v1/bookmarks/folders/:folderId/tweets/:tweetId` — Add tweet to bookmark folder
* `DELETE /api/v1/bookmarks/folders/:folderId/tweets/:tweetId` — Remove tweet from bookmark folder
* `GET /api/v1/bookmarks/folders/:folderId/tweets` — View all tweets in folder (Paginated)

### 👥 Follow & Multi-Timeline Feeds
* `POST /api/v1/follows/toggle/:id` — Follow/unfollow target user (ACID Transaction + Event)
* `GET /api/v1/follows/followers` — Get my followers list
* `GET /api/v1/follows/following` — Get list of users I follow
* `GET /api/v1/feeds?page=1&limit=20` — Get home timeline feed
* `GET /api/v1/feeds/verified?page=1&limit=20` — Get timeline feed exclusively from verified creators

### 💬 Comments & Threaded Replies
* `POST /api/v1/comments/tweet/:tweetId` — Create comment or threaded reply (`parentComment: "id"`)
* `GET /api/v1/comments/tweet/:tweetId` — Get top-level comments for tweet
* `GET /api/v1/comments/:commentId/replies` — Get nested replies for a comment
* `DELETE /api/v1/comments/:commentId` — Delete comment (Comment owner or Tweet owner)

### 🏷️ Hashtags & 🔍 Search
* `GET /api/v1/hashtags/trending` — Get top trending hashtags
* `GET /api/v1/hashtags/:title` — Query tweets by hashtag
* `GET /api/v1/search/tweets?q=nodejs` — Search tweets by keyword
* `GET /api/v1/search/users?q=alice` — Search users by username or bio

### ✉️ Direct Messages (DMs)
* `POST /api/v1/messages/send` — Send a direct message (`receiverId`, `content`)
* `GET /api/v1/messages/conversations` — Get list of recent chat conversations
* `GET /api/v1/messages/conversation/:userId` — Get chat history with a specific user
* `PATCH /api/v1/messages/:messageId/read` — Mark a message as read

### 🚫 Blocks & Safety
* `POST /api/v1/blocks/toggle/:userId` — Block or unblock a user (ACID Transaction + Auto-Unfollow)
* `GET /api/v1/blocks` — List all users currently blocked by me

### 🔇 Mutes & Stealth Moderation
* `POST /api/v1/mutes/toggle/:userId` — Mute or unmute a target user
* `GET /api/v1/mutes` — List all users currently muted by me

### 📋 Lists & Curated Feeds
* `POST /api/v1/lists` — Create a new List (`name`, `description`, `isPrivate`, `members`)
* `GET /api/v1/lists/user/me` — Get all lists created by the authenticated user
* `GET /api/v1/lists/:id` — Get list details (Populates owner and members)
* `PATCH /api/v1/lists/:id` — Update list details (List owner only)
* `DELETE /api/v1/lists/:id` — Delete a list (List owner only)
* `POST /api/v1/lists/:id/members/:userId` — Add member to list (List owner only)
* `DELETE /api/v1/lists/:id/members/:userId` — Remove member from list (List owner only)
* `GET /api/v1/lists/:id/tweets` — Get curated timeline feed of tweets authored by list members (Paginated)

### 🚩 Content Moderation & Reports
* `POST /api/v1/reports/tweets/:tweetId` — Report a tweet (`reason: "SPAM" | "HARASSMENT" | "HATE_SPEECH" | "MISINFORMATION" | "VIOLENCE" | "OTHER"`, `description`)
* `GET /api/v1/reports?status=PENDING` — List moderation reports (Paginated, filter by status/reason)
* `GET /api/v1/reports/:id` — Get detailed report information with populated author/reporter
* `PATCH /api/v1/reports/:id/action` — Moderate report (`status: "RESOLVED"`, `actionTaken: "TWEET_HIDDEN" | "TWEET_DELETED" | "NO_ACTION"`)

### 🔔 Notifications
* `GET /api/v1/notifications?page=1&limit=10` — List async notifications
* `POST /api/v1/notifications/:id/read` — Mark single notification as read
* `POST /api/v1/notifications/mark-all-read` — Mark all notifications as read

---

## 📁 Project Directory Structure

```
twitter-modular-monolith/
├── docker-compose.yml
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── api/
│   │   └── v1/
│   │       ├── index.js
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
│   ├── config/
│   │   ├── database.js
│   │   ├── rabbitmq.js
│   │   └── server-config.js
│   ├── middlewares/
│   │   └── auth-middleware.js
│   └── modules/
│       ├── auth/
│       ├── user/
│       ├── tweet/
│       ├── like/
│       ├── retweet/
│       ├── bookmark/
│       ├── follow/
│       ├── comment/
│       ├── hashtag/
│       ├── feed/
│       ├── search/
│       ├── message/
│       ├── block/
│       ├── mute/
│       ├── list/
│       ├── scheduled/
│       ├── report/
│       └── notification/
└── scratch/
    └── run-tests.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** (v6.0+ with replica set enabled for ACID transactions)
* **RabbitMQ** (v3.10+)

### 2. Quick Start with Docker
```bash
docker compose up -d
```
This spins up:
- **MongoDB** on `localhost:27017`
- **RabbitMQ** on `localhost:5672` (Management Dashboard at `http://localhost:15672`)

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=6000
MONGO_URL=mongodb://localhost:27017/twitter
SECRET_TOKEN=your_jwt_secret_key
EXPIRES_IN=7d
SALT_ROUNDS=10
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=NOTIFICATION
RABBITMQ_QUEUE=notification-queue
RABBITMQ_ROUTING_KEY=NOTIFY
```

### 4. Install & Run
```bash
npm install
npm start
```

---

## 🧪 Automated Testing

Execute the comprehensive end-to-end integration test suite (**114 assertions across 18 distinct domain suites**):

```bash
npm test
```

```text
================================================================
📊 FINAL TEST REPORT: 114 PASSED, 0 FAILED (100% SUCCESS)
================================================================
```

---

## 📄 License
This project is licensed under the MIT License.
