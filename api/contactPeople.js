const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const ContactPerson = require('../models/ContactPerson');

// @route   POST api/contact-persons
// @desc    Create contact person
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Imię jest wymagane').not().isEmpty(),
      check('surname', 'Naziwsko jest wymagane').not().isEmpty(),
      check('email', 'E-mail musi być poprawny').optional().isEmail(),
      check('city', 'Miasto jest wymagane').not().isEmpty(),
      check('user', 'Użytkownik musi być przypisany').not().isEmpty(),
      check('company', 'Firma musi być przypisana').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const contactPerson = new ContactPerson({ ...req.body })

      await contactPerson.save()
      res.json(contactPerson)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   GET api/contact-persons/:id
// @desc    Gets queried contact person
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id

  try {
    const contactPerson = await ContactPerson.findById(id)

    if (!contactPerson) {
      return res.status(400).json({ msg: 'Nie znaleziono osoby kontaktowej' });
    }

    res.json(contactPerson)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   PUT api/contact-persons/:id
// @desc    Saves changes to queried contact person
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('email', 'E-mail musi być poprawny').optional().isEmail(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id

    try {
      const contactPerson = await ContactPerson.findByIdAndUpdate(id, req.body, {
        new: true
      })

      res.json(contactPerson)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
})

// @route   DELETE api/contact-persons/:id
// @desc    Deletes queried contact person
// @access  Private
router.delete(
  '/:id',
  auth,
  async (req, res) => {
    const id = req.params.id

    try {
      const contactPerson = await ContactPerson.findByIdAndUpdate(id, { isDeleted: true }, {
        new: true
      })

      if (!contactPerson) {
        return res.status(400).json({ msg: 'Nie znaleziono osoby kontaktowej' });
      }
      res.json(contactPerson)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
})

module.exports = router