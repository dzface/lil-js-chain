require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const Blockchain = require("./src/blockchain");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const bitcoin = new Blockchain();


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
  res.send(`새로운 거래 체결 :${blockIndex}`);
});
app.get("/main", (req, res)=>{
  res.send("this is main page");
});




server.listen(PORT, ()=>{
  console.log(`Server start : ${PORT}`);
});

