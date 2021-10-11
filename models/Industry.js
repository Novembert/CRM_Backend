const mongoose = require('mongoose');
const InudstrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

module.exports = Inudstry = mongoose.model('Inudstry', InudstrySchema);