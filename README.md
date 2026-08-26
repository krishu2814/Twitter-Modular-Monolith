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
| **Bookmark** | Private tweet bookmarks with ACID transaction and paginated saved list |
| **Comment** | Top-level comments and nested replies, cascade deletion, `COMMENT` and `MENTION` event notifications |
| **Follow** | Follow/unfollow toggle with atomic counter updates, self-follow guard, followers list |
| **Hashtag** | Hashtag normalization, indexing, trending aggregation, and querying tweets by hashtag |
| **Feed** | Fan-out timeline generation for authenticated users |
| **Search** | Case-insensitive keyword search for tweets and users with pagination |
| **Message** | 1-on-1 Direct Messaging (DMs), conversation history, and read status |
| **Block** | User blocking/unblocking with ACID transaction, auto-unfollow, DM & feed exclusion |
| **Notification** | Async consumption from RabbitMQ, mark single/all notifications as read |

---

## 📡 API Reference

### 🔐 Authentication & Users
* `POST /api/v1/auth/signup` — Register a new account (`userName`, `email`, `password`)
* `POST /api/v1/auth/signin` — Login and receive JWT (`email`, `password`)
* `GET /api/v1/users` — List all users
* `GET /api/v1/users/:id` — Get user profile by ID (Populates `pinnedTweet`)
* `PATCH /api/v1/users/:id` — Update bio/profile (Authorized)
* `DELETE /api/v1/users/:id` — Delete user account (Authorized)

### ✍️ Tweets, Quotes & Polls
* `POST /api/v1/tweets/create` — Post a new tweet (Supports `#hashtags`, `@mentions`, `media: []`, `quoteTweet: "id"` & `poll: { options: [] }`)
* `GET /api/v1/tweets/get/:id` — Get single tweet with author, quoted tweet, and poll details
* `GET /api/v1/tweets/get` — Get all tweets
* `GET /api/v1/tweets/user/:userId` — Get tweets authored by a specific user (Includes `pinnedTweet`)
* `POST /api/v1/tweets/:id/poll/vote` — Vote on a tweet poll (`optionIndex: 0`)
* `POST /api/v1/tweets/pin/:id` — Pin a tweet to user profile (Author only)
* `POST /api/v1/tweets/unpin` — Unpin current pinned tweet (Author only)
* `PATCH /api/v1/tweets/update/:id` — Update tweet content (Author only)
* `DELETE /api/v1/tweets/delete/:id` — Delete tweet (Author only)

### ❤️ Likes, 🔁 Retweets & 🔖 Bookmarks
* `POST /api/v1/likes/:tweetId` — Toggle like/unlike (ACID Transaction + Event)
* `POST /api/v1/retweets/:tweetId` — Toggle retweet/unretweet (ACID Transaction + Event)
* `GET /api/v1/retweets/tweet/:tweetId` — Get users who retweeted a tweet
* `GET /api/v1/retweets/user/:userId` — Get tweets retweeted by a user
* `POST /api/v1/bookmarks/:tweetId` — Toggle bookmark (Private)
* `GET /api/v1/bookmarks` — List my bookmarked tweets (Paginated)

### 👥 Follow & Feeds
* `POST /api/v1/follows/toggle/:id` — Follow/unfollow target user (ACID Transaction + Event)
* `GET /api/v1/follows/followers` — Get my followers list
* `GET /api/v1/follows/following` — Get list of users I follow
* `GET /api/v1/feeds?page=1&limit=20` — Get home timeline feed

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
