const mongoose = require('mongoose');
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  }
})

module.exports = Role = mongoose.model('Role', RoleSchema);