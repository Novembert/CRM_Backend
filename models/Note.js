const mongoose = require('mongoose');
const NoteSchema = new mongoose.Schema({
  content: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
})

module.exports = Note = mongoose.model('note',NoteSchema);