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
    ref: 'Company',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = Note = mongoose.model('Note',NoteSchema);