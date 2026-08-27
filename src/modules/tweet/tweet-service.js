const mongoose = require('mongoose');
const TweetRepository = require('./tweet-repository');
const HashService = require('../hashtag/hashtag-service');
const UserRepository = require('../user/user-repository');
const { publishEvent } = require('../../utils/producer');

class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashService = new HashService();
        this.userRepository = new UserRepository();
    }

    async create(data) {
        // 1) if this is a quote tweet, check if original tweet exists
        let originalTweet = null;
        if (data.quoteTweet) {
            originalTweet = await this.tweetRepository.getTweetById(data.quoteTweet);
            if (!originalTweet) {
                throw new Error('Quoted tweet not found');
            }
        }

        // 2) format poll if provided
        if (data.poll && data.poll.options) {
            if (!Array.isArray(data.poll.options) || data.poll.options.length < 2 || data.poll.options.length > 4) {
                throw new Error('Poll must have between 2 and 4 options');
            }

            data.poll = {
                question: data.poll.question || data.content,
                options: data.poll.options.map(opt => ({
                    text: typeof opt === 'string' ? opt.trim() : opt.text,
                    votes: 0,
                    voters: []
                })),
                expiresAt: data.poll.expiresAt ? new Date(data.poll.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
        }

        // 3) create the new tweet
        const tweet = await this.tweetRepository.createTweet(data);

        // 3) if quote tweet, increment retweetsCount on quoted tweet & publish event
        if (data.quoteTweet && originalTweet) {
            await this.tweetRepository.updateTweet(data.quoteTweet, { $inc: { retweetsCount: 1 } });

            const originalAuthorId = originalTweet.author && originalTweet.author._id 
                ? originalTweet.author._id.toString() 
                : originalTweet.author.toString();

            // publish RETWEET event (skip if quoting self)
            if (originalAuthorId !== data.author.toString()) {
                await publishEvent({
                    user: originalAuthorId,
                    actor: data.author.toString(),
                    type: "RETWEET",
                    entityId: tweet._id.toString()
                });
            }
        }

        // 4) extract and process hashtags from content if present
        if (data.content) {
            const tags = data.content.match(/(#[a-zA-Z0-9_]+)/g);
            if (tags && tags.length > 0) {
                await this.hashService.processHashtagsFromTweet(tags, tweet._id);
            }
        }

        // 5) extract and process mentions (@username)
        if (data.content) {
            const mentions = data.content.match(/@([a-zA-Z0-9_]+)/g);
            if (mentions && mentions.length > 0) {
                for (let mention of mentions) {
                    const userName = mention.replace('@', '').trim();
                    const mentionedUser = await this.userRepository.getUserByUsername(userName);
                    if (mentionedUser && mentionedUser._id.toString() !== data.author.toString()) {
                        await publishEvent({
                            user: mentionedUser._id.toString(),
                            actor: data.author.toString(),
                            type: "MENTION",
                            entityId: tweet._id.toString()
                        });
                    }
                }
            }
        }

        return tweet;
    }

    async delete(id, userId) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized to delete this tweet');
        }

        return await this.tweetRepository.deleteTweet(id);
    }

    async update(id, userId, data) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized to update this tweet');
        }

        const updatedTweet = await this.tweetRepository.updateTweet(id, data);

        if (data.content) {
            const tags = data.content.match(/(#[a-zA-Z0-9_]+)/g);
            if (tags && tags.length > 0) {
                await this.hashService.processHashtagsFromTweet(tags, id);
            }
        }

        return updatedTweet;
    }

    async get(id) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }
        return tweet;
    }

    async getAll() {
        return await this.tweetRepository.getAllTweets();
    }

    async getTweetsByUser(userId, page = 1, limit = 10) {
        const user = await this.userRepository.getUserById(userId);
        const result = await this.tweetRepository.getTweetsByUser(userId, page, limit);

        let pinnedTweet = null;
        if (user && user.pinnedTweet) {
            pinnedTweet = await this.tweetRepository.getTweetById(user.pinnedTweet);
        }

        return {
            pinnedTweet,
            tweets: result.tweets,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }

    // Pin tweet to user profile
    async pinTweet(id, userId) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized to pin this tweet');
        }

        await this.userRepository.setPinnedTweet(userId, id);
        return { pinnedTweet: id };
    }

    // Unpin tweet from profile
    async unpinTweet(userId) {
        await this.userRepository.clearPinnedTweet(userId);
        return { pinnedTweet: null };
    }

    // Vote on a tweet poll
    async votePoll(tweetId, userId, optionIndex) {
        // 1) verify tweet exists
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        // 2) verify tweet has an active poll
        if (!tweet.poll || !tweet.poll.options || tweet.poll.options.length === 0) {
            throw new Error('This tweet does not contain a poll');
        }

        // 3) check poll expiration
        if (tweet.poll.expiresAt && new Date() > new Date(tweet.poll.expiresAt)) {
            throw new Error('This poll has expired');
        }

        // 4) check if optionIndex is valid
        const idx = parseInt(optionIndex);
        if (isNaN(idx) || idx < 0 || idx >= tweet.poll.options.length) {
            throw new Error('Invalid poll option index');
        }

        // 5) check if user has already voted in this poll
        const hasVoted = tweet.poll.options.some(opt =>
            opt.voters && opt.voters.some(voterId => voterId.toString() === userId.toString())
        );

        if (hasVoted) {
            throw new Error('You have already voted in this poll');
        }

        // 6) record vote
        const updatedTweet = await this.tweetRepository.votePoll(tweetId, idx, userId);
        return updatedTweet.poll;
    }

    // Record view impression on a tweet
    async recordView(tweetId) {
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }
        const updated = await this.tweetRepository.incrementViews(tweetId);
        return { tweetId, viewsCount: updated.viewsCount };
    }

    // Get tweet engagement analytics
    async getAnalytics(tweetId, userId) {
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized: only the tweet author can view detailed analytics');
        }

        const views = tweet.viewsCount || 0;
        const likes = tweet.likesCount || 0;
        const retweets = tweet.retweetsCount || 0;
        const comments = tweet.commentsCount || 0;
        const bookmarks = tweet.bookmarksCount || 0;
        const totalEngagements = likes + retweets + comments + bookmarks;
        const engagementRate = views > 0 ? ((totalEngagements / views) * 100).toFixed(2) + '%' : '0.00%';

        return {
            tweetId: tweet._id,
            content: tweet.content,
            createdAt: tweet.createdAt,
            metrics: {
                viewsCount: views,
                likesCount: likes,
                retweetsCount: retweets,
                commentsCount: comments,
                bookmarksCount: bookmarks,
                totalEngagements
            },
            engagementRate
        };
    }

    // Create a multi-tweet thread atomically (2-10 tweets)
    async createThread(authorId, data) {
        if (!data || !Array.isArray(data.tweets) || data.tweets.length < 2 || data.tweets.length > 10) {
            throw new Error('Thread must contain between 2 and 10 tweets');
        }

        // Validate each tweet item
        for (let i = 0; i < data.tweets.length; i++) {
            const item = data.tweets[i];
            if (!item || !item.content || item.content.trim() === '') {
                throw new Error(`Tweet at position ${i + 1} cannot have empty content`);
            }
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const createdTweets = [];
            let rootTweet = null;
            const threadLength = data.tweets.length;

            for (let i = 0; i < threadLength; i++) {
                const item = data.tweets[i];
                const tweetData = {
                    content: item.content.trim(),
                    author: authorId,
                    media: Array.isArray(item.media) ? item.media : [],
                    quoteTweet: item.quoteTweet || null,
                    isThread: true,
                    threadLength: threadLength,
                    threadPosition: i + 1,
                    parentTweet: i === 0 ? null : createdTweets[i - 1]._id,
                    threadHead: i === 0 ? null : rootTweet._id
                };

                const tweet = await this.tweetRepository.createTweetWithSession(tweetData, session);
                if (i === 0) {
                    rootTweet = tweet;
                }
                createdTweets.push(tweet);
            }

            await session.commitTransaction();
            session.endSession();

            // Asynchronously process hashtags and mentions for all created tweets
            for (const tweet of createdTweets) {
                if (tweet.content) {
                    const tags = tweet.content.match(/(#[a-zA-Z0-9_]+)/g);
                    if (tags && tags.length > 0) {
                        await this.hashService.processHashtagsFromTweet(tags, tweet._id);
                    }

                    const mentions = tweet.content.match(/@([a-zA-Z0-9_]+)/g);
                    if (mentions && mentions.length > 0) {
                        for (let mention of mentions) {
                            const userName = mention.replace('@', '').trim();
                            const mentionedUser = await this.userRepository.getUserByUsername(userName);
                            if (mentionedUser && mentionedUser._id.toString() !== authorId.toString()) {
                                await publishEvent({
                                    user: mentionedUser._id.toString(),
                                    actor: authorId.toString(),
                                    type: "MENTION",
                                    entityId: tweet._id.toString()
                                });
                            }
                        }
                    }
                }
            }

            return {
                rootTweetId: rootTweet._id,
                threadLength,
                thread: createdTweets
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // Get the sequential thread conversation chain
    async getThread(tweetId) {
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        // Determine the root tweet ID
        let rootTweetId = tweet._id;
        if (tweet.threadHead) {
            rootTweetId = tweet.threadHead;
        } else if (tweet.parentTweet) {
            let current = tweet;
            while (current.parentTweet) {
                const parent = await this.tweetRepository.getTweetById(current.parentTweet);
                if (!parent) break;
                current = parent;
            }
            rootTweetId = current._id;
        }

        const threadTweets = await this.tweetRepository.getThreadTweets(rootTweetId);
        return {
            rootTweetId,
            threadLength: threadTweets.length,
            tweets: threadTweets.length > 0 ? threadTweets : [tweet]
        };
    }

    // Edit tweet with 30-minute grace window
    async editTweet(tweetId, userId, data) {
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized: only the author can edit this tweet');
        }

        if (!data.content || data.content.trim() === '') {
            throw new Error('Tweet content cannot be empty');
        }

        // Check 30-minute grace period
        const now = new Date();
        const createdAt = new Date(tweet.createdAt);
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (diffInMinutes > 30) {
            throw new Error('Editing grace window (30 minutes) has expired. Tweets cannot be edited after 30 minutes of creation.');
        }

        const previousContent = tweet.content;
        const previousMedia = tweet.media;
        const newContent = data.content.trim();

        const updatedTweet = await this.tweetRepository.editTweet(tweetId, {
            content: newContent,
            media: data.media !== undefined ? data.media : tweet.media,
            previousContent,
            previousMedia
        });

        // Re-extract and index hashtags
        const tags = newContent.match(/(#[a-zA-Z0-9_]+)/g);
        if (tags && tags.length > 0) {
            await this.hashService.processHashtagsFromTweet(tags, tweetId);
        }

        // Re-extract mentions and publish MENTION events for new mentions
        const oldMentions = new Set((previousContent.match(/@([a-zA-Z0-9_]+)/g) || []).map(m => m.replace('@', '').trim()));
        const newMentions = (newContent.match(/@([a-zA-Z0-9_]+)/g) || []).map(m => m.replace('@', '').trim());

        for (let userName of newMentions) {
            if (!oldMentions.has(userName)) {
                const mentionedUser = await this.userRepository.getUserByUsername(userName);
                if (mentionedUser && mentionedUser._id.toString() !== userId.toString()) {
                    await publishEvent({
                        user: mentionedUser._id.toString(),
                        actor: userId.toString(),
                        type: "MENTION",
                        entityId: tweetId.toString()
                    });
                }
            }
        }

        return updatedTweet;
    }
}

module.exports = TweetService;
