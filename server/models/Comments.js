const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({
    // 1. 댓글 작성자
    // 2. POST ID
    // 3. 대댓글
    // 4. 내용

    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    responseTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: 'String'
    }

}, { timestamps: true });
//timestamps ==> 만들날과 업데이트한 날이 기록되어 표시됨

const Comment = mongoose.model('Comment', commentSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { Comment }