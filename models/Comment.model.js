const { Schema, model } = require('mongoose');
const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expense: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
  message: { type: String, required: true },
  date: { type: Schema.Types.Date, default: new Date(), required: true },
});

const Comment = model('Comment', commentSchema);

module.exports = Comment;
