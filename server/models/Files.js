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
    path: { //경로
        type: String,
    },
    size: { //크기
        type: Number,
        default: 0
    },
    description: {//설명
        type: String,
        default: ""
    },
    tags: {
        type: Array,
        default: []
    },
    writer: { //작성자
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

fileSchema.index({
    filename: 'text',
    description: 'text'
}, {
    weights: {
        filename: 5,
        description: 1
    }
})

const File = mongoose.model('file', fileSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { File }