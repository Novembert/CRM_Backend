const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Company = require('../models/Company');

// @route   POST api/companies
// @desc    Create company
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Nazwa jest wymagana').not().isEmpty(),
      check('nip', 'NIP jest wymagany').not().isEmpty(),
      check('nip', 'NIP musi mieć 10 znaków').isLength({ min: 10, max:10 }),
      check('city', 'Miasto jest wymagane').not().isEmpty(),
      check('user', 'Użytkownik musi być przypisany').not().isEmpty(),
      check('industry', 'Branża musi być przypisana').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, nip, address, city, user, industry } = req.body

    try {
      const company = new Company({ name, nip, address, city, user, industry })

      await company.save()
      res.json(company)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   GET api/companies/:id
// @desc    Gets queried company
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id

  try {
    const company = await Company.findById(id)

    if (!company) {
      return res.status(400).json({ msg: 'Nie znaleziono firmy' });
    }

    res.json(company)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   PUT api/companies/:id
// @desc    Saves changes to queried company
// @access  Private
router.put(
  '/:id', 
  [
    auth,
    [
      check('nip', 'NIP musi mieć 10 znaków').isLength({ min: 10, max:10 }),
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id

    try {
      const company = await Company.findByIdAndUpdate(id, req.body, {
        new: true
      })

      if (!company) {
        return res.status(400).json({ msg: 'Nie znaleziono firmy' });
      }

      res.json(company)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   DELETE api/companies/:id
// @desc    Deletes queried company
// @access  Protected
router.delete('/:id', auth, async (req,res) => {
  const id = req.params.id
  try {
    let company = await Company.findByIdAndUpdate(id, { isDeleted: true }, {
      new: true
    })

    if (!company) {
      return res.status(400).json({ msg: 'Nie znaleziono firmy' });
    }
    res.json(company)
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

module.exports = router