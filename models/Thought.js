const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');


const thoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 280
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (timestamp) => dateFormat(timestamp)
    },
    username: {
      type: String,
      required: true
    },
    reactions: [
      {
        reactionId: {
          type: Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        reactionBody: {
          type: String,
          required: true,
          maxlength: 280
        },
        username: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now,
          get: (timestamp) => dateFormat(timestamp)
        }
      }
    ]
  },
  {
    toJSON: {
      getters: true,
      virtuals: true
    },
    id: false
  }
);

const dateFormat = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

thoughtSchema.virtual('reactionCount').get(function() {

  return this.reactions.length;
});

const Thought = model('Thought', thoughtSchema);

module.exports = Thought;