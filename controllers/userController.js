const { User, Thought } = require('../models');

const userController = {
  // Get all users
  getUsers(req, res) {
    User.find()
      .then(users => res.json(users))
      .catch(err => res.status(500).json(err));
  },

  // Get a single user 
  getSingleUser(req, res) {
    User.findOne({ _id: req.params.userId })
      .select('-__v')
      .then(user =>
        !user
          ? res.status(404).json({ message: 'No user with that ID' })
          : res.json(user)
      )
      .catch(err => res.status(500).json(err));
  },

  // Create a user
  createUser(req, res) {
    User.create(req.body)
      .then(user => {
        // Create a default thought for the user
        return Thought.create({
          thoughtText: "Welcome to our social network!",
          username: user.username,
          userId: user._id
        })
        .then(thought => {
          user.thoughts.push(thought._id); 
          return user.save();
        })
        .then(() => res.json(user));
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json(err);
      });
  },

  // Update a user
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
    .then(user =>
      !user
        ? res.status(404).json({ message: 'No user with this id!' })
        : res.json(user)
    )
    .catch(err => res.status(500).json(err));
  },

  // Delete a user
  deleteUser(req, res) {
    User.findOneAndDelete({ _id: req.params.userId })
      .then(user =>
        !user
          ? res.status(404).json({ message: 'No user with that ID' })
          : Thought.deleteMany({ _id: { $in: user.thoughts } })
      )
      .then(() => res.json({ message: 'User and associated thoughts deleted!' }))
      .catch(err => res.status(500).json(err));
  },

  // Add a friend
  addFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
    .then(user =>
      !user
      ? res.status(404).json({ message: 'No user with this id!' })
      : User.findOneAndUpdate(
        { _id: req.params.friendId },
        { $addToSet: { friends: req.params.userId } },
        { runValidators: true, new: true }
      )
      .then(friend => res.json(user))
      .catch(err => res.status(500).json(err))
    );
  },

  // Remove a friend
  removeFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
    .then(user =>
      !user
      ? res.status(404).json({ message: 'No user with this id!' })
      : User.findOneAndUpdate(
        { _id: req.params.friendId },
        { $pull: { friends: req.params.userId } },
        { runValidators: true, new: true }
      )
      .then(friend => res.json(user))
      .catch(err => res.status(500).json(err))
    );
  },
};

module.exports = userController;
