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


app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json()); // json 파씽 필수 코드


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




server.listen(PORT, ()=>{
  console.log(`Server start : ${PORT}`);
});

