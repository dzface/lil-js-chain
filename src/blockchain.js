const {sha256, createTransactionId} = require("./crypto");
const currentNodeUrl = process.argv[3];
function Blockchain(){
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.chain = [];
  this.pendingTransaction = [];
  this.createNewBlock(0, "0","0");
};
// 위 함수는 클래스로도 만들수 있으나 자바스크립트는
// 내부적으로 클래스가 없고 클래스안에 constructor 메서드가 실행되므로
// 그냥 함수로 만들어서 사용함
// class Blockchain {
//   constructor() {
//     this.chain = [];
//     this.newTransaction = [];
//   }
// }

// nonce: 랜덤생성 토큰, previousBlockHash: 이전블록의주소, currentHash:현재 블록의 주소
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, currentHash){
  const newBlock = {
    index: this.chain.length +1,//블록번호
    timestamp: Date.now(),
    transactions: this.pendingTransaction,
    nonce,
    previousBlockHash,
    currentHash,
  };
  this.pendingTransaction = [];
  this.chain.push(newBlock);
  return newBlock;
};

// chain 배열에서 마지막 블록을 호출하는 함수
Blockchain.prototype.getLastBlock = function(){
  return this.chain[this.chain.length -1];
};
// 거래가 발생할때 실행되는 함수 amount: 양, sender 보낸사람 주소, 받는사람 주소
Blockchain.prototype.createNewTransaction = function(amount, sender, receiver){
  const transactionId = createTransactionId()
  const newTransaction = {
    amount: amount,
    sender: sender,
    receiver: receiver,
    transactionId
  };
  this.pendingTransaction.push(newTransaction);
  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj){
  this.pendingTransaction.push(transactionObj);
  return this.getLastBlock()["index"]+1;
}


// 해시문자 생성
Blockchain.prototype.createHash = function(nonce, previousBlockHash, currentBlockData){
  const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};
// 작업증명(해시문자 검증) hash가 일치 할때까지 nonce(난수)를 1씩 증가시켜 테스트하고 일치할경우 nonce를 리턴
// 즉 몇번만에 해시가 일치했는지 반환해줌
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
  let nonce = 0;
  let hash = this.createHash(nonce, previousBlockHash, currentBlockData);
  while(hash.substring(0,4) !=="0000"){
    nonce++;
    hash = this.createHash(nonce, previousBlockHash, currentBlockData);
  };
  return nonce;
};
module.exports = Blockchain;
