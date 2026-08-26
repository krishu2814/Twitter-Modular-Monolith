const MuteRepository = require('./mute-repository');
const UserRepository = require('../user/user-repository');

class MuteService {
    constructor() {
        this.muteRepository = new MuteRepository();
        this.userRepository = new UserRepository();
    }

    // 1) toggle mute/unmute
    async toggleMute(muterId, mutedId) {
        if (muterId.toString() === mutedId.toString()) {
            throw new Error('You cannot mute yourself');
        }

        const targetUser = await this.userRepository.getUserById(mutedId);
        if (!targetUser) {
            throw new Error('User to mute not found');
        }

        const existingMute = await this.muteRepository.findMute(muterId, mutedId);

        if (existingMute) {
            // UNMUTE
            await this.muteRepository.removeMute(muterId, mutedId);
            return { muted: false };
        }

        // MUTE
        await this.muteRepository.createMute(muterId, mutedId);
        return { muted: true };
    }

    // 2) get list of muted users
    async getMutedUsers(userId) {
        return await this.muteRepository.getMutedUsers(userId);
    }
}

module.exports = MuteService;
