const express = require('express')
const mongoose = require('mongoose')

const Evaluation = require('./models/Evaluation')
const Ninja = require('./models/Ninja')
const Client = require('./models/Client')

mongoose.connect('mongodb://localhost:27017/foo-ninja-eval', () => console.log('db connected'))

const app = express()

app.get('/evaluations/clients', (req, res) => {
  const { name } = req.query

  let { count } = req.query
  count = parseInt(count, 10)
  if (typeof count !== 'number' || Number.isNaN(count)) {
    count = 5
  }

  Ninja.findOne({ name }, (error, ninja) => {
    if (error) return res.status(500).send(error).end()
    if (!ninja) return res.status(404).send('No ninja with that name').end()
    getNinjaEvaluations(ninja)
  })

  function getNinjaEvaluations (ninja) {
    Evaluation
      .find({ ninja })
      .sort({ updatedAt: 'desc' })
      .limit(count)
      .populate('client')
      .exec((error, evaluations) => {
        if (error) return res.status(500).send(error).end()
        returnEvaluationClientNames(evaluations)
      })
  }

  function returnEvaluationClientNames (evaluations) {
    const clientNames = evaluations.map(
      evaluation => evaluation.client.name
    )
    res.send(clientNames).end()
  }
})


//
// Utility routes to create ninja/client/evaluation
// method == 'get' for ease of use in browser
//

app.get('/ninja/add', (req, res) => {
  const { name } = req.query
  if (!name) return res.status(400).send('Missing ninja name in query').end()
  Ninja.findOne({ name }, (error, ninja) => {
    if (error) return res.status(500).send(error).end()
    if (ninja) return res.status(400).send('Already exists').end()
    createNinja()
  })

  function createNinja () {
    new Ninja({ name }).save(error => {
      if (error) return res.status(500).send(error).end()
      res.send('ok').end()
    })
  }
})

app.get('/clients/add', (req, res) => {
  const { name } = req.query
  if (!name) return res.status(400).send('Missing client name in query').end()
  Client.findOne({ name }, (error, client) => {
    if (error) return res.status(500).send(error).end()
    if (client) return res.status(400).send('Already exists').end()
    createClient()
  })

  function createClient () {
    new Client({ name }).save(error => {
      if (error) return res.status(500).send(error).end()
      res.send('ok').end()
    })
  }
})

app.get('/evaluations/add', (req, res) => {
  const { ninjaName, clientName } = req.query

  Ninja.findOne({ name: ninjaName }, (error, ninja) => {
    if (error) return res.status(500).send(error).end()
    if (!ninja) return res.status(400).send('No such ninja').end()
    getClient(ninja)
  })

  function getClient (ninja) {
    Client.findOne({ name: clientName }, (error, client) => {
      if (error) return res.status(500).send(error).end()
      if (!client) return res.status(400).send('No such client').end()
      findExistingEvaluation(ninja, client)
    })
  }

  function findExistingEvaluation (ninja, client) {
    Evaluation.findOne({ ninja, client }, (error, evaluation) => {
      if (error) return res.status(500).send(error).end()
      if (evaluation) return res.status(400).send('Evaluation already exists').end()
      createEvaluation(ninja, client)
    })
  }

  function createEvaluation (ninja, client) {
    new Evaluation({ ninja, client }).save(error => {
      if (error) return res.status(500).send(error).end()
      res.send('ok').end()
    })
  }
})

//
// Start server
//
app.listen(1080, () => console.log('server listening on 1080'))
