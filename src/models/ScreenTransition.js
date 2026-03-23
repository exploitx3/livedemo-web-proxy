const mongoose = require('mongoose')
const ScreenTransitionTypes = require('../constants/ScreenTransitionTypes')

const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}


const ScreenPageTransitionSchema = new mongoose.Schema({
  type: { type: String, default: ScreenTransitionTypes.HOTSPOT}, //EClick | Hotspot

  selector: { type: String },
  gotoType: { type: String }, // screen | website | none
  gotoWebsite: { type: String },
  gotoScreen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },

  frameX: { type: Number },
  frameY: { type: Number },
  text: { type: String }, // screen | website | none
}, options)

module.exports = ScreenPageTransitionSchema
