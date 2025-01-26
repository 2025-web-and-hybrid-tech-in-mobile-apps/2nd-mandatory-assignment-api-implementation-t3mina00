const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const Ajv = require("ajv")
const ajv = new Ajv()
const port = process.env.PORT || 3000;

const schema = {
  type: "object",
  properties: {
    userHandle: {type: "string"},
    password: {type: "string"}
  },
  required: ["userHandle", "password"],
  additionalProperties: false
}

app.use(express.json()); // for parsing application/json

const SECRET_KEY = "secretkey"
let correctUserHandle = ""
let correctPassword = ""
let highScores = []

// Your solution should be written here
app.post('/signup', (req, res) => {
  const { userHandle, password } = req.body
  if (!userHandle || !password) {
    return res.status(400).send('Invalid request body')
  }
  if (userHandle.length < 6 || password.length < 6) {
    return res.status(400).send('Invalid request body')
  }
  correctUserHandle = userHandle
  correctPassword = password

  res.status(201).send('User registered successfully')

})

app.post('/login', (req, res) => {
  const valid = ajv.validate(schema, req.body)
  if (!valid) {
    return res.status(400).send('Bad Request')
  }
  const { userHandle, password } = req.body
  if (!userHandle || !password) {
    return res.status(400).send('Bad Request')
  }
  if (userHandle !== correctUserHandle || password !== correctPassword) {
    return res.status(401).send('Unauthorized, incorrect username or password')
  }

  // Generate JWT token
  const token = jwt.sign({ userHandle: userHandle }, SECRET_KEY)
  res.status(200).send({ jsonWebToken: token })

})

app.post('/high-scores', (req, res) => {
  const { level, userHandle, score, timestamp } = req.body
  if (!level || !userHandle || !score || !timestamp) {
    return res.status(400).send('Invalid request body')
  }

  let token = req.get('Authorization')
  if (!token) {
    return res.status(401).send('Unauthorized, JWT token is missing or invalid')
  }
  token = token.split(' ')[1]
  if (token !== jwt.sign({ userHandle: userHandle }, SECRET_KEY)) {
    return res.status(401).send('Unauthorized, JWT token is missing or invalid')
  }

  highScores.push({ level: level, userHandle: userHandle, score: score, timestamp: timestamp })

  res.status(201).send('High score posted successfully')
})

app.get('/high-scores', (req, res) => {
  const level = req.query.level
  const page = req.query.page

  let result = highScores.filter(score => score.level === level)
  result.sort((a, b) => b.score - a.score)
  if (page) {
    result = result.slice((page - 1) * 20, page * 20)
  } else {
    result = result.slice(0, 20)
  }

  res.status(200).send(result)
})

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
