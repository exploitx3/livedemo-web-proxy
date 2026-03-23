const mongoose = require('mongoose')
const options = {
  strict: false,
  timestamps: { createdAt: true, updatedAt: true }
}

const JobSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      index: true
    },
    data: {},
    type: {
      type: String,
      default: 'normal',
      enum: ['normal', 'single']
    },
    priority: {
      type: Number,
      default: 0,
      min: -20,
      max: 20,
      index: 1
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lockedAt: {
      type: Date,
    },
    disabled: { type: Boolean, default: false },
    repeatInterval: {
      type: String
    },
    repeatTimezone: {
      type: String,
      default: null
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Subscription'
    },
    lastFinishedAt: { type: Date }
  }, options
)

module.exports = JobSchema
