const mongoose = require('mongoose')
const options = {
  strict: true,
  timestamps: { createdAt: true, updatedAt: true },
}


const ScreenNavigationSchema = new mongoose.Schema({
  selector: { type: String },
  gotoType: { type: String }, // screen | website | none
  gotoWebsite: { type: String },
  gotoScreen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
})

module.exports = ScreenNavigationSchema
