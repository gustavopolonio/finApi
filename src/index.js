const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()
app.use(express.json())

const customers = []

// Middleware
function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers
  const customer = customers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return res.status(400).json({ error: "Customer not found." })
  }

  req.customer = customer

  return next()
}

function getBalance(customer) {
  const balance = customer.statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }

  }, 0)

  return balance
}

app.post("/account", (req, res) => {
  const { name, cpf } = req.body

  const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" })
  }

  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: []
  })

  return res.status(201).send()
})

// app.use(verifyIfExistsAccountCPF)

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req

  return res.json( customer.statement )
})

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req
  const { amount, description } = req.body

  customer.statement.push({
    amount,
    description,
    type: "credit",
    createdAt: new Date()
  })

  return res.status(201).send()
})

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req
  const { amount } = req.body

  const balance = getBalance(customer)

  if (amount > balance) {
    return res.status(400).json({ error: "Insufficient balance." })
  }

  customer.statement.push({
    amount,
    type: "debit",
    createdAt: new Date()
  })

  return res.status(201).send()
})

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req
  const { date } = req.query

  const dateFormatted = new Date(date + " 00:00")

  const operations = customer.statement.filter(operation => 
    operation.createdAt.toDateString() === new Date(dateFormatted).toDateString()
  )

  return res.json(operations)
})


app.listen(3333, () => {
  console.log("Server initialized")
})