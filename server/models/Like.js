const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//좋아요 기능
const likeSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    contentsId: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });
//timestamps ==> 만들날과 업데이트한 날이 기록되어 표시됨

const Like = mongoose.model('Like', likeSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { Like }