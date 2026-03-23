const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true }
}

const Graph = new mongoose.Schema({

    type: {type: String},
    nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
    pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pair' }],
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },

  }, options
)

module.exports = Graph
