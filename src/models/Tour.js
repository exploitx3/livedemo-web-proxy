const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const StepSchema = require('./Step')

const Tour = new mongoose.Schema({

    name: { type: String }, // channel | workspace
    options: {
      shouldAutoStart: {type: Boolean, default: true},
      startOnPath: {type: String, default: '/'}
    },
    steps: [
      StepSchema
    ],
    liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' },

  }, options
)

module.exports = Tour
