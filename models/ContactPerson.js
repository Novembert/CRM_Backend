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
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
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

module.exports = ContactPersonSchema = mongoose.model('ContactPerson', ContactPersonSchema);