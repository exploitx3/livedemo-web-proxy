const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Pair = new mongoose.Schema({

    innerId: {type: String},
    fromSlackId: { type: String },
    toSlackId: { type: String },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connections' }],
    interactions: {type: Number}
  }, options
)

module.exports = Pair
