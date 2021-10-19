const mongoose = require('mongoose')
let CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nip: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  }
})

CompanySchema.path('nip').validate((value) => {
  reg = /^\d{10}$/
  return reg.test(value)
}, 'NIP has to consist of 10 digits.')

module.exports = CompanySchema = mongoose.model('Company', CompanySchema);