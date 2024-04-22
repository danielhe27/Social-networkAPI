const { ObjectId } = require('mongoose');
const { Thought, User } = require('../models');

const thoughtController = {
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
    User.findOneAndDelete({ _id: req.params.userId })
      .then(user =>
        !user
          ? res.status(404).json({ message: 'No user found with this ID!' })
          : Thought.findOneAndDelete({ _id: req.params.thoughtId })
      )
      .then(() => res.json({ message: 'Thought deleted!' }))
      .catch(err => res.status(500).json(err));
  }
};

module.exports = thoughtController;
