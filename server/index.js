const express = require('express')
const app = express()
const cors = require('cors')
const port = 3042
const keccak = require('ethereum-cryptography/keccak')
const secp = require("ethereum-cryptography/secp256k1")
const { hexToBytes, toHex } = require('ethereum-cryptography/utils')

app.use(cors())
app.use(express.json())

function hashMessage(message) {
  return keccak.keccak256(Uint8Array.from(message))
}

function signatureToPublicKey(message, signature) {
 const hash = hashMessage(message);
  const fullSignatureBytes = hexToBytes(signature);
  const recoveryBit = fullSignatureBytes[0];
  const signatureBytes = fullSignatureBytes.slice(1);

  return secp.recoverPublicKey(hash, signatureBytes, recoveryBit);
}

/*
private keys 
bd863b492ffee40fe5cb840c63fb27addd250adc90a4d63664658fb49a61193f
ea714991d3aff8fb9745ea597ce0aa2825f599622afc397beb24f0e3ac092638
7aa4e12eb9e0ba24c03e8e7a9215b8805dae097b2031100c9ea4583c6e870303
*/
const balances = {
  '04d4fdcb49139820e48b4af6851a8fd8d7f25df75f85866955830bd7fdbe35c9b722baaccad83bbb85316f3a6ca25464502d7d38f6b6e0b9d25b88e32455e52800': 100,
  '04df37c976d3af29b6e8cbcd91b67a34313c7a2127763344c909ab98bb9df924a7d8e5482d8dbc71f2832aae6abb72fbe1cab654c45cd5f59a6eb23d6de005aca3': 50,
  '042c40995e3c64dc2e7e54ab0a2643f434e001b4fa6e06b3a34a62e08490c13d425bc48e586c6e0378632a5e383c249eb1b387fd752a3294046cb5b74e9f7e27f7': 75,
}

app.get('/balance/:address', (req, res) => {
  const { address } = req.params
  const balance = balances[address] || 0
  res.send({ balance })
})

app.post('/send', (req, res) => {
  const signature = req.body.signature;
  const message = req.body.message;
  const { recipient, amount } = message

  const pubKey = signatureToPublicKey(message, signature)
  const sender = toHex(pubKey)

  setInitialBalance(sender)
  setInitialBalance(recipient)

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' })
  } else {
    balances[sender] -= amount
    balances[recipient] += amount
    res.send({ balance: balances[sender] })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0
  }
}
