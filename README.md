# Blueberry CLOUD

### 2021-03-13
### First Init
- 기본적인 서버 환경 구성
- bcrypt
- JWT(jsonWebToken)
- proxy middleware 사용

### 2021-03-14
 - 로그인, 회원가입 기능 확인

### 업로드 루트 생성
- 프로젝트 루트에 uploads 폴더 생성되도록 함

### save, insert 차이
- save는 _id 중복검사 후 덮어쓰기(update)
- insert는 중복검사 후 오류 발생

### deleteMany, deleteOnde?
fileList에 들어있는 [_id,_id,_id...] 형태의 배열을 한번에 지울수 있는 형태의 쿼리
단일 삭제 할때는 deleteOne을 사용
```
File.deleteMany({ _id: { $in: fileList } }, (err, obj) => {
        if (err) res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, count: obj.deletedCount });
    })
```

### 저장되는 폴더 경로 수정
    - MAIN / 사용자 ID(각 root 폴더) / 클라우드 내 폴더 / 저장 날짜(YYYYMMDD) / file | picture | video
    - 할려고 했는데 formData에서 path를 가져와서 저장하는 방법을 할수가 없어서 임시적으로 MAIN/날짜 로 하는 방향으로 설정
    - 동영상 저장 부분에서 수정 완료
    - 파일을 저장할때 원본 저장소에서 가져와서 -> 신규 경로로 파일 이동시킴

### ffmpeg .mp4 Converter
    - 핸드폰으로 촬영한 영상 혹은 기타 영상들 중 인코딩 방식이 h.264가 아닌 경우가 있었다.
    - video Element의 경우 지원가능한 코덱이 얼마 없기 때문에 수정해줘야함
    ```
        ffmpeg(원본 파일명을 포함한 파일경로)
        .videoCodec('libx264')
        .format('mp4')
        .on('error', (err) => {
            console.log("Video Convert Error" + err)
            return res.json({ success: false, err })
        })
        .on("end", () => {
            fs.unlinkSync(원본 파일명을 포함한 파일경로); // 이건 기존 파일 삭제할때 쓸려고 둔거
            return res.json({
                success: true
                , newFilePath: convert
            })
        })
        .save( /folders/converted.mp4 ) //새로 저장될 파일경로 및 명
    ```
    - 라이브러리 특성인지 원본파일을 대체(덮어쓰기)는 불가능해 보였다. 
    - 원본파일 생성-> 다른위치에 컨버팅한 파일 생성 -> 원본파일 삭제 -> 컨버팅 경로를 리턴해줌
    - 위 형태를 따라서 해주었다.

### 친구 단계를 세분화 할것

### 댓글 정책은 대댓글 까지만 실행할것
