const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

const previousBlockHash = "QPOIFMOPKW2134848";
const currentBlockData = [
  {
    amount:10,
    sender: "bybit1234",
    recipent: "upbit1234"
  },
  {
    amount:20,
    sender: "bybit23532",
    recipent: "upbit1234"
  },
  {
    amount:100,
    sender: "bybit344444",
    recipent: "upbit1234"
  },
];



console.log(bitcoin.createHash(100, previousBlockHash, currentBlockData));
