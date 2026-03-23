const mongoose = require('mongoose')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
  discriminatorKey: 'type'
}

const ScreenScreenshotTransitionSchema = require('./ScreenScreenshotTransition')
const ScreenTransitionSchema = require('./ScreenTransition')

const ScreenScreenshot = new mongoose.Schema({
    imageUrl: { type: String },


  }, options
)

module.exports = ScreenScreenshot
