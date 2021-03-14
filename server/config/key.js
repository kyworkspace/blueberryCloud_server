if(process.env.NODE_ENV === 'production'){
    module.exports = require('./prod');
}else{
    module.exports = require('./dev');
}
//개발 환경과 배포 환경이 다르기 때문에 NODE_ENV를 이용해서 
//키값을 어디서 가져올건지를 판단함