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
}

module.exports = TweetService;
