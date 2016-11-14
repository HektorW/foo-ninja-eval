const mongoose = require('mongoose')

const evaluationSchema = new mongoose.Schema({
  ninja: { type: mongoose.Schema.Types.ObjectId, ref: 'Ninja' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, {
  timestamps: true
})

module.exports = mongoose.model('Evaluation', evaluationSchema)
