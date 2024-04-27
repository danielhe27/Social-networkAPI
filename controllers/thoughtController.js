const { Thought, User } = require('../models');

const thoughtController = {
  // Add a reaction to a thought
  addReaction(req, res) {
    const { thoughtId } = req.params;
    const { reactionBody, username } = req.body;

    // Create a new reaction object
    const newReaction = { reactionBody, username };

    Thought.findByIdAndUpdate(
      thoughtId,
      { $push: { reactions: newReaction } },
      { new: true, runValidators: true } 
    )
    .then(updatedThought => {
      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought found with this ID!' });
      }
      res.json(updatedThought);
    })
    .catch(err => res.status(500).json(err));
  },

  // Remove a reaction from a thought
  removeReaction(req, res) {
    const { thoughtId, reactionId } = req.params;

    Thought.findByIdAndUpdate(
      thoughtId,
      { $pull: { reactions: {reactionId : reactionId } } }, 
      { new: true }
    )
    .then(updatedThought => {
      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought found with this ID!' });
      }
      res.json(updatedThought);
    })
    .catch(err => res.status(500).json(err));
  },

  // Get all thoughts
  getThoughts(req, res) {
    Thought.find()
      .then(thoughts => res.json(thoughts))
      .catch(err => res.status(500).json(err));
  },

  // Get a single thought
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')
      .then(thought =>
        !thought
          ? res.status(404).json({ message: 'No thought with that ID' })
          : res.json(thought)
      )
      .catch(err => res.status(500).json(err));
  },

  // Create a thought
  createThought(req, res) {
    Thought.create(req.body)
      .then(thought =>
        User.findOneAndUpdate(
          { _id: req.body.userId },
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        )
        .then(user =>
          !user
            ? res.status(404).json({ message: 'No user found with this ID!' })
            : res.json({ message: 'Thought created', thought })
        )
      )
      .catch(err => {
        console.error(err);
        return res.status(500).json(err);
      });
  },

  // Update a thought
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
    .then(thought =>
      !thought
        ? res.status(404).json({ message: 'No thought with this id!' })
        : res.json(thought)
    )
    .catch(err => res.status(500).json(err));
  },

  // Delete a thought
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then(thought => {
        if (!thought) {
          return res.status(404).json({ message: 'No thought found with this ID!' });
        }
        return User.findOneAndUpdate(
          { _id: req.params.userId },
          { $pull: { thoughts: thought._id } }
        );
      })
      .then(() => res.json({ message: 'Thought deleted!' }))
      .catch(err => res.status(500).json(err));
  }
};

module.exports = thoughtController;
