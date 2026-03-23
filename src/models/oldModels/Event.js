const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Event = new mongoose.Schema({

    name: { type: String }, // channel | workspace
    type: { type: String }, // info | error | saga
    data: { }
  }, options
)

module.exports = Event
