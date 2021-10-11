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
    ref: 'Company'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = Note = mongoose.model('Note',NoteSchema);