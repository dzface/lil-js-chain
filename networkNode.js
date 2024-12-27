require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const Blockchain = require("./src/blockchain");
const PORT = process.argv[2];
const app = express();
const server = http.createServer(app);
const bitcoin = new Blockchain();
const uuid = require("./src/crypto");
const nodeAddress = uuid//.uuid.split("-").join(""); // uuid 생성시 특수문자 제거
const requestPromise = require("request-promise");


app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json()); // json 파씽 필수 코드

// endpoint
// app.get("/", (request, response)=>{
//   response.sendFile(path.join(__dirname,"./public/index.html"));
// })
app.get("/", (req, res)=>{
  res.send("check server starting");
});
app.get("/blockchain", (req, res)=>{
  res.send(bitcoin);
});
app.post("/transaction", (req, res)=>{
  const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.receiver);
  const data = req.body;
  res.send(`새로운 거래 체결 블록 :${blockIndex}`);
});
app.get("/mine", (req, res)=>{
  const lastBlock =bitcoin.getLastBlock(); 
  console.log("이전 블록:", lastBlock);
  const previousBlockHash = lastBlock.currentHash; // lastBlock.currentHash 또는 lastBlock["currentHash"];
  const currentBlockData = {
    transactions: bitcoin.pendingTransaction,
    index: lastBlock['index'] + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.createHash(nonce, previousBlockHash, currentBlockData);
  bitcoin.createNewTransaction(6.25, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    message: "새로운 블록 생성",
    block: newBlock
  });
});

// 접속한 노드가 포트주소 등 정보를 전달받음
app.post("/register-and-broadcast-node", (req, res)=>{
  const newNodeUrl = req.body.newNodeUrl;
  if(bitcoin.networkNodes.indexOf(newNodeUrl) === -1) bitcoin.networkNodes.push(newNodeUrl);
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl =>{
    const requestOptions ={
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: {newNodeUrl: newNodeUrl},
      json: true
    };
    regNodesPromises.push(requestPromise(requestOptions));
  });
  // 노드 정보가 다른 노드들에게 모두 전달되어야 아래 코드를 반환함
  Promise.all(regNodesPromises) 
  .then(data =>{
    const bulkRegisterOptions = {
      uri: newNodeUrl + "/register-nodes-bulk",
      method: "POST",
      body: {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
      json: true
    };
    return requestPromise(bulkRegisterOptions);
  })
  .then(data =>{
    res.json({note: "새로운 노드가 추가되었습니다."});
  });
});
// /register-and-broadcast-node 주소로 전달받은 노드가 정보를 다른 노드에 /register-node주소로 전달
app.post("/register-node", (req, res)=>{
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreayPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if(nodeNotAlreayPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
  res.json({note: "새로운 노드가 추가되었습니다."});
});
// /register-and-broadcast-node의 노드는 다른 노드들의 정보를 /register-nodes-bulk 주소로 전달 받음
app.post("/register-nodes-bulk", (req, res)=>{
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl =>{
    const nodeNotAlreayPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const currentNodeUrl = bitcoin.currentNodeUrl !== networkNodeUrl;
    if(nodeNotAlreayPresent && currentNodeUrl) bitcoin.networkNodes.push(networkNodeUrl);
  });
  res.json({note: "노드 정보 분배 완료"});
});


app.post("/transaction/broadcast", (req,res)=>{
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.receiver);
  bitcoin.addTransactionToPendingTransactions(newTransaction);
const requestPromise = [];

  bitcoin.networkNodes.forEach(networkNodeUrl=>{
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body : newTransaction,
      json : true
    };
    requestPromise.push(requestPromise(requestOptions));
  });
  Promise.all(requestPromise)
  .then(data=>{
    res.json({note: "트랜젝션 정보 분산 완료"});
  });
});



server.listen(PORT, ()=>{
  console.log(`Server start : ${PORT}`);
});

