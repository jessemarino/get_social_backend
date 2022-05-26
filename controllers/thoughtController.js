const { thought, user } = require("../models");

module.exports = {
  // Function to get all of the thoughts by invoking the find() method with no arguments.
  // Then we return the results as JSON, and catch any errors. Errors are sent as JSON with a message and a 500 status code
  getthought(req, res) {
    thought
      .find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  // Gets a single thought using the findOneAndUpdate method. We pass in the ID of the thought and then respond with it, or an error if not found
  getSinglethought(req, res) {
    thought
      .findOne({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with that ID" })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Creates a new thought. Accepts a request body with the entire thought object.
  // Because thoughts are associated with users, we then update the user who created the app and add the ID of the thought to the thoughts array
  createthought(req, res) {
    thought
      .create(req.body)
      .then((thought) => {
        return user.findOneAndUpdate(
          { _id: req.body.userId },
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        );
      })
      .then((user) =>
        !user
          ? res.status(404).json({
              message: "thought created, but found no user with that ID",
            })
          : res.json("Created the thought 🎉")
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  // Updates and thought using the findOneAndUpdate method. Uses the ID, and the $set operator in mongodb to inject the request body. Enforces validation.
  updatethought(req, res) {
    thought
      .findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id!" })
          : res.json(thought)
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  // Deletes an thought from the database. Looks for an app by ID.
  // Then if the app exists, we look for any users associated with the app based on he app ID and update the thoughts array for the user.
  deletethought(req, res) {
    thought
      .findOneAndRemove({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id!" })
          : user.findOneAndUpdate(
              { thoughts: req.params.thoughtId },
              { $pull: { thoughts: req.params.thoughtId } },
              { new: true }
            )
      )
      .then((user) =>
        !user
          ? res.status(404).json({
              message: "thought created but no user with this id!",
            })
          : res.json({ message: "thought successfully deleted!" })
      )
      .catch((err) => res.status(500).json(err));
  },
  // Adds a tag to an thought. This method is unique in that we add the entire body of the tag rather than the ID with the mongodb $addToSet operator.
  addTag(req, res) {
    thought
      .findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $addToSet: { tags: req.body } },
        { runValidators: true, new: true }
      )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id!" })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Remove thought tag. This method finds the thought based on ID. It then updates the tags array associated with the app in question by removing it's tagId from the tags array.
  removeTag(req, res) {
    thought
      .findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $pull: { tags: req.params.tagId } },
        { runValidators: true, new: true }
      )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id!" })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
};