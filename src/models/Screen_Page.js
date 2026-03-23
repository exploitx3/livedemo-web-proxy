const mongoose = require('mongoose')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

const ScreenStepSchema = require('./ScreenStep')
// const ScreenTransitionSchema = require('./ScreenTransition')

const ScreenTransitionSchema = require('./ScreenTransition')
const ScreenPageTransitionSchema = require('./ScreenPageTransition')

const ScreenPage = new mongoose.Schema({

    contentPath: { type: String },
    steps: [
      ScreenStepSchema
    ],
    width: { type: mongoose.Number},
    height: { type: mongoose.Number},


  }, options
)

module.exports = ScreenPage
