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