const mongoose = require('mongoose');
const IndustrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  }
})

module.exports = Industry = mongoose.model('Industry', IndustrySchema);