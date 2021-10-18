const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { check, validationResult } = require('express-validator');

const User = require('./../models/User');
const Company = require('./../models/Company');
const Note = require('./../models/Note');
const ContactPerson = require('./../models/ContactPerson');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('login', 'Proszę podać login').not().isEmpty(),
    check('password', 'Proszę podać hasło dłuższe niż 7 znaków').isLength({
      min: 8
    }),
    check('name', `Pole 'imię' jest wymagane`)
      .not()
      .isEmpty(),
    check('surname', `Pole 'nazwisko' jest wymagane`)
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    //handling errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password, name, surname } = req.body;

    try {
      //check if the user already exists
      if (await checkForExistingUserByLogin(login)) {
        return res.status(400).json({
          errors: [{ msg: 'Użytkownik z podanym loginem już istnieje' }]
        });
      }

      let user = new User({
        login,
        password,
        name,
        surname,
      });

      user.password = await hashPassword(password);

      await user.save();

      const tokenPayLoad = { user: { id: user.id } };
      jwt.sign(
        tokenPayLoad,
        config.get('jwtSecret'),
        { expiresIn: 7200 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/users/:id
// @desc    Gets queried user
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id

  try {
    const user = await User.findById(id).select('-password').populate({model: 'Role', path: 'role' })

    if (!user) {
      return res.status(400).json({ msg: 'Nie znaleziono uzytkownika' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   GET api/users/:id/companies
// @desc    Gets queried user's companies
// @access  Private
router.get('/:id/companies', auth, async (req, res) => {
  const id = req.params.id

  try {
    const companies = await Company.find({
      user: id,
      isDeleted: false
    })

    res.json(companies)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   GET api/users/:id/notes
// @desc    Gets queried user's notes
// @access  Private
router.get('/:id/notes', auth, async (req, res) => {
  const id = req.params.id

  try {
    const notes = await Note.find({
      user: id,
      isDeleted: false
    })

    res.json(notes)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   GET api/users/:id/contact-persons
// @desc    Gets queried user's contact persons
// @access  Private
router.get('/:id/contact-persons', auth, async (req, res) => {
  const id = req.params.id

  try {
    const contactPersons = await ContactPerson.find({
      user: id,
      isDeleted: false
    })

    res.json(contactPersons)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   PUT api/users/:id
// @desc    Saves changes to queried user
// @access  Private
router.put('/:id', [
    auth,
    [
      check('login', 'Nie można zmienić loginu').not().not().isEmpty(),
      check('password', 'Nie można zmienić hasła').not().not().isEmpty(),
    ],
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id

  try {
    let user = await User.findByIdAndUpdate(id, req.body, {
      new: true
    }).select('-password')

    if (!user) {
      return res.status(400).json({ msg: 'Nie znaleziono uzytkownika' });
    }
    res.json(user)
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   DELETE api/users/:id
// @desc    Deletes queried user
// @access  Private
router.delete('/:id', [auth, checkRole(['Administrator'])], async (req,res) => {
  const id = req.params.id
  try {
    let user = await User.findByIdAndUpdate(id, { isDeleted: true }, {
      new: true
    }).select('-password')

    if (!user) {
      return res.status(400).json({ msg: 'Nie znaleziono uzytkownika' });
    }
    res.json(user)
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

async function checkForExistingUserByLogin(login) {
  const user = await User.findOne({ login });
  if (user) {
    return true;
  } else return false;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = router;