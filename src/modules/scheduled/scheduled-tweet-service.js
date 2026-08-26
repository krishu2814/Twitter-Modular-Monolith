const ScheduledTweetRepository = require('./scheduled-tweet-repository');
const TweetService = require('../tweet/tweet-service');

class ScheduledTweetService {
    constructor() {
        this.scheduledTweetRepository = new ScheduledTweetRepository();
        this.tweetService = new TweetService();
    }

    // 1) schedule a new tweet
    async scheduleTweet(authorId, data) {
        if (!data.content || data.content.trim() === '') {
            throw new Error('Tweet content cannot be empty');
        }

        if (!data.scheduledFor) {
            throw new Error('scheduledFor date is required');
        }

        const scheduledDate = new Date(data.scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
            throw new Error('Invalid scheduledFor date format');
        }

        if (scheduledDate <= new Date()) {
            throw new Error('Scheduled date must be in the future');
        }

        const scheduledData = {
            author: authorId,
            content: data.content.trim(),
            media: Array.isArray(data.media) ? data.media : [],
            scheduledFor: scheduledDate,
            status: 'SCHEDULED'
        };

        return await this.scheduledTweetRepository.create(scheduledData);
    }

    // 2) get author's scheduled tweets
    async getMyScheduledTweets(authorId) {
        return await this.scheduledTweetRepository.getByAuthor(authorId);
    }

    // 3) cancel a scheduled tweet
    async cancelScheduledTweet(id, authorId) {
        const scheduledTweet = await this.scheduledTweetRepository.getById(id);
        if (!scheduledTweet) {
            throw new Error('Scheduled tweet not found');
        }

        const tweetAuthorId = scheduledTweet.author && scheduledTweet.author._id
            ? scheduledTweet.author._id.toString()
            : scheduledTweet.author.toString();

        if (tweetAuthorId !== authorId.toString()) {
            throw new Error('Unauthorized: only the author can cancel this scheduled tweet');
        }

        if (scheduledTweet.status !== 'SCHEDULED') {
            throw new Error(`Cannot cancel a tweet with status ${scheduledTweet.status}`);
        }

        return await this.scheduledTweetRepository.cancel(id);
    }

    // 4) process and publish all due tweets
    async publishDueTweets() {
        const dueTweets = await this.scheduledTweetRepository.findDueTweets(new Date());
        const publishedResults = [];

        for (let st of dueTweets) {
            try {
                // Publish actual tweet through TweetService (handles hashtags, mentions, etc.)
                const tweet = await this.tweetService.create({
                    content: st.content,
                    author: st.author,
                    media: st.media
                });

                // Mark scheduled tweet as published
                const updated = await this.scheduledTweetRepository.markAsPublished(st._id, tweet._id);
                publishedResults.push(updated);
            } catch (error) {
                console.error(`❌ Failed to auto-publish scheduled tweet ${st._id}:`, error);
            }
        }

        return {
            processedCount: dueTweets.length,
            publishedCount: publishedResults.length,
            published: publishedResults
        };
    }
}

module.exports = ScheduledTweetService;
