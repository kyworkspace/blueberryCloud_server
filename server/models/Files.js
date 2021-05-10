const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = mongoose.Schema({
    filename: { //파일명
        type: String,
        trim: true
    },
    mimetype: { //타입
        type: String,
    },
    originalname: { //오리지날 파일명
        type: String,
    },
    originalpath: { //실제 파일 경로
        type: String,
    },
    cloudpath: {
        type: String,
        default: 'ALL'
    },
    size: { //크기
        type: Number,
        default: 0
    },
    thumbnailpath: { //동영상 썸네일
        type: String,
        default: ""
    },
    description: {//설명
        type: String,
        default: ""
    },
    tags: {
        type: Array,
        default: []
    },
    importance: {
        // 0 : 즐겨찾기
        // 1 : 폴더
        // 2 : 일반 파일
        //중요도
        type: Number,
        default: 2
    },
    writer: { //작성자
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    openrating: {
        //공개여부
        // 0 : 전체 공개
        // 1 : 친구에게만 공개
        // 2 : 비공개

        type: Number,
        default: 2
    }
}, { timestamps: true });

fileSchema.index({
    cloudpath: 'text',
    filename: 'text',
    description: 'text',
}, {
    weights: {
        cloudpath: 5,
        filename: 3,
        description: 1
    }
})

const File = mongoose.model('file', fileSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { File }