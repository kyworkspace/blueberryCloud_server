const fs = require('fs');

//파일 저장 경로
const CloudFileMotherPath = "D:/BluberryCloud";

const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        //없으면 폴더 생성
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 초기 폴더 구축
makeFolder(`${CloudFileMotherPath}/tempfolder`)
//영상 임시 저장 루트
makeFolder(`${CloudFileMotherPath}/tempfolder/converted`);
//썸네일 임시저장 루트
makeFolder(`${CloudFileMotherPath}/tempfolder/thumbnails/`);

module.exports = {
    CloudFileMotherPath,
    makeFolder
}