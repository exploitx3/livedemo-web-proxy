const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}


const ScreenStepSchema = new mongoose.Schema({
  index: { type: Number }, //View, Action
  view: {
    viewType: {type: String, default: 'Post'}, // Post, Pointer
    content: {type: String, default: ''},
    selector: {type: String, default: ''},
    placement: {type: String, default: 'auto'},
    formId: {type:  mongoose.Schema.Types.ObjectId, ref: 'Form' },
    nextButtonText: {type: String, default: 'Next'},
    showStepNumbers: {type: Boolean, default: true},
    /*
      top, top-start, top-end
      bottom, bottom-start, bottom-end
      left, left-start, left-end
      right, right-start, right-end
      auto (it will choose the best position)
      center (set the target to body)
     */

  },
  action: {
    actionType: {type: String, default: 'NextButton'}, // NextButton, ElementClick
    selector: {type: String, default: ''},
  }

})

module.exports = ScreenStepSchema
