const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
app.get("/", (request, response)=>{
  response.sendFile(path.join(__dirname,"public"));
})
app.use(express.static(path.join(__dirname,"/public.index.html")));



server.listen(3000, ()=>{
  console.log("hello");
})

