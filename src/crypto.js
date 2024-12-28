const crypto = require("crypto");
require("dotenv").config();
// 해시코드 생성 함수
function sha256(data) {
  const hashAlgorithm = crypto.createHash(process.env.HASH_ALGORITHM); // 암호화 알고리즘 결정
  const hashedData = hashAlgorithm.update(data); // 해싱
  const hashedSting = hashedData.digest("hex"); // 인코딩 출력할 형식 결정
  return hashedSting;
  // 한줄로 줄이기 crypto.createHash("sha256").update(data).digest("hex");
};
// 기본 node모듈이 있어서 삭제
// // 노드 주소대체 UUID 생성함수 (receiver의 지갑주소에 해당)
// function uuid(){
//   const UUID = crypto.randomUUID().split("-").join("");  // uuid 생성시 특수문자 제거
//   return UUID;
// };

// 거래시 발생하는 transaction에 대한 고유 아이디 생성
function createTransactionId() {
  return crypto.randomBytes(16).toString("hex");
};


module.exports = {sha256, createTransactionId}; 
