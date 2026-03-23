const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const SagaEvent = new mongoose.Schema({

    name: { type: String }, // populateWorkspaceSaga
    status: { type: String }, // executing | finished
    data: {},
    events: [{ type: Object }], // the full event object
    executionCounter: { type: Number, default: 0}
  }, options
)

module.exports = SagaEvent
