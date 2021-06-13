const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noticeSchema = mongoose.Schema({

    title: {
        type: String,
    },
    subTitle: {
        type: String,
    },
    contents: {
        type: String
    },
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });
//timestamps ==> 만들날과 업데이트한 날이 기록되어 표시됨

const Notice = mongoose.model('Notice', noticeSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { Notice }