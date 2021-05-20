const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//친구 및 팔로워 관계
/**
 * level 0 : 친구 아님 -> 친구 거절 했을때 전환
 * level 1 : 팔로잉 -> 그냥 팔로잉
 * level 2 : 친구 신청 -> 거절하면 0으로 전환
 * lever 3 : 친구
 * **/

const friendsSchema = mongoose.Schema({
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    level: {
        type: Number,
        default: 0
    },

})

const Friends = mongoose.model('friends', friendsSchema);

module.exports = { Friends }