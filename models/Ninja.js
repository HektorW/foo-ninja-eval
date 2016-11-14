const mongoose = require('mongoose')

const ninjaSchema = new mongoose.Schema({
  name: String
})

module.exports = mongoose.model('Ninja', ninjaSchema)
