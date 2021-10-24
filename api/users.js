const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { likeRelation, clearFilters, calculateSkip, generateOrder }  = require('./lib')
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

// @route   POST api/users/all
// @desc    Get all users (with filter)
// @access  Private
router.post('/all', auth, async (req, res) => {
  const { name, surname, dateOfBirth, login, role, page, paginate, order = 'surname', orderType = 'asc' } = req.body

  try {
    let filters = {
      name: likeRelation(name), 
      surname: likeRelation(surname), 
      dateOfBirth, 
      login: likeRelation(login),
      role
    }
    filters = clearFilters(filters)
    const users = await User.find({ ...filters, isDeleted: false }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate).populate('role', 'name -_id')
    const count = await User.find({ ...filters, isDeleted: false }).countDocuments()
    res.json({ data: users, count})
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

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

// @route   POST api/users/:id/companies
// @desc    Gets queried user's companies (with filter)
// @access  Private
router.post('/:id/companies', auth, async (req, res) => {
  const id = req.params.id
  const { name, nip, address, city, industry, page, paginate, order = 'name', orderType = 'asc' } = req.body

  try {
    let filters = {
      name: likeRelation(name), 
      nip: likeRelation(nip), 
      address: likeRelation(address), 
      city: likeRelation(city),
      industry
    }
    filters = clearFilters(filters)

    const companies = await Company.find({
      ...filters, 
      user: id,
      isDeleted: false
    }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)
    const count = await Company.find({
      ...filters, 
      user: id,
      isDeleted: false
    }).countDocuments()

    res.json({ data: companies, count })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   POST api/users/:id/notes
// @desc    Gets queried user's notes (with filter)
// @access  Private
router.post('/:id/notes', auth, async (req, res) => {
  const id = req.params.id
  const { date, order = 'createdAt', orderType = 'desc', page, paginate } = req.body

  try {
    let filters = {
      date
    }
    filters = clearFilters(filters)

    const notes = await Note.find({
      ...filters,
      user: id,
      isDeleted: false
    }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)

    const count = await Note.find({
      ...filters, 
      user: id,
      isDeleted: false
    }).countDocuments()

    res.json({data: notes, count })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   POST api/users/:id/contact-persons
// @desc    Gets queried user's contact persons (with filter)
// @access  Private
router.post('/:id/contact-persons', auth, async (req, res) => {
  const id = req.params.id
  const { name, surname, phone, mail, order = 'name', orderType = 'asc', page, paginate } = req.body

  try {
    let filters = {
      name: likeRelation(name),
      surname: likeRelation(surname),
      phone: likeRelation(phone),
      mail: likeRelation(mail),
    }
    filters = clearFilters(filters)

    const contactPersons = await ContactPerson.find({
      user: id,
      isDeleted: false,
      ...filters
    }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)

    const count = await ContactPerson.find({
      ...filters, 
      user: id,
      isDeleted: false
    }).countDocuments()

    res.json({ data: contactPersons, count })
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

  if (req.body.role && req.user.role !== 'Administrator') {
    return res.status(401).json({ msg: 'Brak uprawnień do edycji roli użytkownika' })
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