const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
})

module.exports = User = mongoose.model('User', UserSchema);