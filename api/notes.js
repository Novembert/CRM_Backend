const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Note = require('../models/Note');

// @route   POST api/notes
// @desc    Create note
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('user', 'Użytkownik musi być przypisany').not().isEmpty(),
      check('company', 'Firma musi być przypisana').not().isEmpty(),
      check('content', 'Notatka musi zawierać treść').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const note = new Note({ ...req.body })

      await note.save()
      res.json(note)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   PUT api/notes/:id
// @desc    Update note
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('content', 'Notatka musi zawierać treść').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id

    try {
      const note = await Note.findByIdAndUpdate(id, req.body, {
        new: true
      })

      if (!note) {
        return res.status(400).json({ msg: 'Nie znaleziono notatki' });
      }

      res.json(note)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   DELETE api/notes/:id
// @desc    Delete note
// @access  Private
router.delete(
  '/:id',
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id

    try {
      const note = await Note.findByIdAndUpdate(id, { isDeleted: true }, {
        new: true
      })

      if (!note) {
        return res.status(400).json({ msg: 'Nie znaleziono notatki' });
      }

      res.json(note)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

module.exports = router