const Mute = require('./mute-model');

class MuteRepository {

    // 1) create mute record
    async createMute(muterId, mutedId) {
        return await Mute.create({ muter: muterId, muted: mutedId });
    }

    // 2) remove mute record
    async removeMute(muterId, mutedId) {
        return await Mute.findOneAndDelete({ muter: muterId, muted: mutedId });
    }

    // 3) find existing mute
    async findMute(muterId, mutedId) {
        return await Mute.findOne({ muter: muterId, muted: mutedId });
    }

    // 4) check if userA has muted userB
    async isMuted(muterId, targetUserId) {
        const mute = await Mute.findOne({ muter: muterId, muted: targetUserId });
        return !!mute;
    }

    // 5) get all users muted by a user
    async getMutedUsers(userId) {
        return await Mute.find({ muter: userId }).populate('muted', 'userName profileImage bio');
    }

    // 6) get list of muted IDs by a user (for feed filtering)
    async getMutedIds(userId) {
        const mutes = await Mute.find({ muter: userId }).select('muted');
        return mutes.map(m => m.muted);
    }
}

module.exports = MuteRepository;
