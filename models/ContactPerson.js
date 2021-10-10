const mongoose = require('mongoose');
let ContactPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  mail: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company'
  },
  position: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
}) 

ContactPersonSchema.pre('validate', function(next) {
  if (!(this.mail || this.phone)) {
      next(new Error('Any contact information has to be provided.'));
  } else {
      next();
  }
});

module.exports = ContactPersonSchema = mongoose.model('contactPerson', ContactPersonSchema);