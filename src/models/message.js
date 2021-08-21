const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String
  },
  name: {
    type: String
  },
  timestamp: {
    type: Number
  },
  has_attachment: {
    type: Boolean
  }
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = {Message};
