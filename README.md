# 🐦 Twitter Modular Monolith Backend

A production-grade, event-driven **Twitter backend** built with **Node.js**, **Express**, **MongoDB**, and **RabbitMQ** using a **Modular Monolith Architecture**.

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

### Key Engineering Features:
* **4-Layer Modular Architecture**: Strict separation of concerns — `Routes` $\to$ `Controllers` $\to$ `Services` $\to$ `Repositories` $\to$ `Models`.
* **ACID Transactions**: Multi-document transactional integrity for Likes, Retweets, Follows, and Bookmarks using `mongoose.startSession()`.
* **Event-Driven Asynchronous Notifications**: Decoupled event publishing via **RabbitMQ** (`NOTIFICATION` direct exchange, durable queues, manual ACK consumer).
* **Fan-out Feed Aggregation**: Timeline generation aggregating tweets and quote tweets from followed creators plus self.
* **Auto Hashtag & Mention Extraction**: Automatic regex parsing for `#hashtags` and `@user` mentions with asynchronous notification dispatches.
* **Threaded Comment Conversations**: Parent-child comment threading with cascade deletion and atomic counter synchronizations.
* **Pinned Profile Tweets**: Support for pinning a featured tweet to the top of the user profile.
* **Interactive Tweet Polls**: Create 2-4 option polls with single-vote enforcement, real-time tallying, and expiration dates.

---

## 📦 Domain Modules

| Module | Responsibilities |
|---|---|
| **Auth** | User signup, bcrypt password hashing, JWT token authentication, login validation |
| **User** | User profile fetching, bio updates, follower/following counter tracking, pinned tweets |
| **Tweet** | Tweet creation, polls, quote tweets, hashtags & mentions extraction, pinning, author authorization |
| **Like** | Toggle tweet likes with ACID transaction + RabbitMQ `LIKE` event notification |
| **Retweet** | Toggle retweets with ACID transaction + RabbitMQ `RETWEET` event notification |
| **Bookmark** | Private tweet bookmarks with ACID transaction, saved list, and custom categorized Folders/Collections |
| **Comment** | Top-level comments and nested replies, cascade deletion, `COMMENT` and `MENTION` event notifications |
| **Follow** | Follow/unfollow toggle with atomic counter updates, self-follow guard, followers list |
| **Hashtag** | Hashtag normalization, indexing, trending aggregation, and querying tweets by hashtag |
| **Feed** | Fan-out timeline generation for authenticated users |
| **Search** | Case-insensitive keyword search for tweets and users with pagination |
| **Message** | 1-on-1 Direct Messaging (DMs), conversation history, and read status |
| **Block** | User blocking/unblocking with ACID transaction, auto-unfollow, DM & feed exclusion |
| **Mute** | Stealth muting/unmuting of users with automatic feed timeline suppression |
| **List** | Twitter Lists creation, member management, privacy controls, and dedicated member feeds |
| **ScheduledTweet** | Future tweet scheduling, cancellation, status lifecycle, and auto-publishing engine |
| **Report** | Content moderation, violation reporting (SPAM, HARASSMENT, etc.), auto-flagging, and admin actioning |
| **Notification** | Async consumption from RabbitMQ, mark single/all notifications as read |

---

## 📡 API Reference

### 🔐 Authentication & Users
* `POST /api/v1/auth/signup` — Register a new account (`userName`, `email`, `password`)
* `POST /api/v1/auth/signin` — Login and receive JWT (`email`, `password`)
* `GET /api/v1/users` — List all users
* `GET /api/v1/users/recommendations/who-to-follow` — Graph-based "Who to Follow" recommendations (Friends-of-friends algorithm)
* `GET /api/v1/users/:id` — Get user profile by ID (Populates `pinnedTweet`, `isVerified`, `badgeType`)
* `PATCH /api/v1/users/:id/verify` — Update verification status & badge (`isVerified: true`, `badgeType: "BLUE" | "GOLD" | "OFFICIAL"`)
* `PATCH /api/v1/users/:id` — Update bio/profile (Authorized)
* `DELETE /api/v1/users/:id` — Delete user account (Authorized)

### ✍️ Tweets, Quotes & Polls
* `POST /api/v1/tweets/create` — Post a new tweet (Supports `#hashtags`, `@mentions`, `media: []`, `quoteTweet: "id"` & `poll: { options: [] }`)
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

### 👥 Follow & Feeds
* `POST /api/v1/follows/toggle/:id` — Follow/unfollow target user (ACID Transaction + Event)
* `GET /api/v1/follows/followers` — Get my followers list
* `GET /api/v1/follows/following` — Get list of users I follow
* `GET /api/v1/feeds?page=1&limit=20` — Get home timeline feed
* `GET /api/v1/feeds/verified?page=1&limit=20` — Get timeline feed exclusively from verified creators

### 💬 Comments & Replies
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

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** (v6.0+ with replica set for ACID transactions)
* **RabbitMQ**

### 2. Quick Start with Docker
```bash
docker compose up -d
```
This spins up:
- **MongoDB** on `localhost:27017`
- **RabbitMQ** on `localhost:5672` (Management Dashboard at `http://localhost:15672`)

### 3. Environment Variables
Create a `.env` file based on `.env.example`:
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

### 4. Start Application
```bash
npm install
npm start
```

---

## 🧪 Running Automated Tests

Run the complete 47-assertion end-to-end integration test suite:
```bash
node scratch/run-tests.js
```
