const LikeRepository = require('./like-repository');

class LikeService {
    constructor() {
        this.likeRepository = new LikeRepository();
    }

    // like <-> unlike 
    async toggleLike(userId, tweetId) {

        // if already liked -> unlike it
        const alreadyLiked = await this.likeRepository.findUserIdAndTweetId(userId, tweetId);

        // delete the like -> unlike
        if (alreadyLiked) {
            await this.likeRepository.delete(alreadyLiked._id);
            return { liked: false };
        }

        // if not liked before
        await this.likeRepository.create({
            user: userId,
            tweet: tweetId
        });

        return { liked: true};
    }
}

module.exports = LikeService;
