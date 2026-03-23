const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}


const StepSchema = new mongoose.Schema({
  index: { type: Number }, //View, Action
  fields: [{
    label: {type: String, default: ''},
    name: {type: String, default: ''},
    type: {type: String, default: 'shortText'}, // shortText
    required: {type: Boolean, default: true},
    typeData: {}
  }],
  title: {type: String, default: 'Get in touch with us'},
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
  liveDemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveDemo' },
  screenId: {type: mongoose.Schema.Types.ObjectId, ref: 'Screen'  },
  leads: {type: mongoose.Schema.Types.ObjectId, ref: 'Lead'}
})

module.exports = StepSchema
