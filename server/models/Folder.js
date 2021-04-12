const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const folderSchema = mongoose.Schema({
    foldername: { //파일명
        type: String,
        trim: true
    },
    path: { //경로
        type: String,
    },
}, { timestamps: true });

folderSchema.index({
    foldername: 'text',
}, {
    weights: {
        foldername: 5,
    }
})

const Folder = mongoose.model('folder', folderSchema); //컬렉션(테이블)명, 스키마, 사용자정의명(여기선안씀)

module.exports = { Folder }