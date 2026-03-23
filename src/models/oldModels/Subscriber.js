const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}

const Subscriber = new mongoose.Schema({
    subscriberHash: { type: String },
    email: { type: String },

  }, options
)

module.exports = Subscriber
