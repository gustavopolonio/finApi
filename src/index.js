const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()
app.use(express.json())

const customers = []

app.post("/account", (req, res) => {
  const { name, cpf } = req.body
  const id = uuidv4()

  customers.push({
    id,
    name,
    cpf,
    statement: []
  })

  return res.status(201).send()
})


app.listen(3333, () => {
  console.log("Server initialized")
})