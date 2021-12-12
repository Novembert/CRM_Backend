const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const mongoose = require('mongoose')
const checkRole = require('../middleware/checkRole');
const { likeRelation, clearFilters, calculateSkip, generateOrder }  = require('./lib')
const { check, validationResult } = require('express-validator');

const User = require('./../models/User');
const Company = require('./../models/Company');
const Note = require('./../models/Note');
const Role = require('./../models/Role');
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
      .isEmpty(),
    check('surname', `Pole 'rola' jest wymagane`)
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    //handling errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password, name, surname, role } = req.body;

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
        role
      });

      user.password = await hashPassword(password);

      await user.save();

      // const tokenPayLoad = { user: { id: user.id } };
      // jwt.sign(
      //   tokenPayLoad,
      //   config.get('jwtSecret'),
      //   { expiresIn: 7200 },
      //   (error, token) => {
      //     if (error) throw error;
      //     res.json({ token });
      //   }
      // );
      res.json(user)
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
    }
    filters = clearFilters(filters)

    let aggregation = [
      { "$match": { ...filters, isDeleted: false }},
      { "$lookup": {
        "from": Role.collection.name,
        "localField": "role",
        "foreignField": "_id",
        "as": "role"
      }},
      { "$unwind": "$role" },
      { "$sort": generateOrder(order, orderType)},
      { "$skip": calculateSkip(page, paginate)},
      { "$limit": paginate},
      { "$project": { 
        "name": 1,
        "surname": 1,
        "login": 1,
        'dateOfBirth': 1,
        'role.name': 1,
        'role._id': 1,
        '_id': 1
      }}
    ]

    if (role) {
      aggregation.splice(-4, 0, { "$match": { "role._id": new mongoose.Types.ObjectId(role)}})
    }

    const users = await User.aggregate(aggregation)
    const count = await User.find({ ...filters, isDeleted: false }).countDocuments()
    res.json({ data: users, count})
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   GET api/users/all
// @desc    Get all users (without filter)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
    res.json(users)
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

    let aggregation = [
      { "$match": { ...filters, isDeleted: false }},
      { "$lookup": {
        "from": Industry.collection.name,
        "localField": "industry",
        "foreignField": "_id",
        "as": "industry",
      }},
      { "$lookup": {
        "from": User.collection.name,
        "localField": "user",
        "foreignField": "_id",
        "as": "user"
      }},
      { "$unwind": "$industry" },
      { "$unwind": "$user" },
      { "$match": { "user._id": new mongoose.Types.ObjectId(id)}},
      { "$sort": generateOrder(order, orderType)},
      { "$skip": calculateSkip(page, paginate)},
      { "$limit": paginate},
      { "$project": { 
        "_id": 1,
        "user.name": 1,
        "user.surname": 1,
        'name': 1,
        'nip': 1,
        'address': 1,
        'city': 1,
        'industry.name': 1,
        'industry._id': 1,
      }}
    ]

    const companies = await Company.aggregate(aggregation)

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
    }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate).populate({model: 'User', path: 'user', select: {'name': 1, 'surname': 1}}) 

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

// @route   POST api/users/:id/contact-people
// @desc    Gets queried user's contact persons (with filter)
// @access  Private
router.post('/:id/contact-people', auth, async (req, res) => {
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

    const contactPeople = await ContactPerson.find({
      user: id,
      isDeleted: false,
      ...filters
    }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)

    const count = await ContactPerson.find({
      ...filters, 
      user: id,
      isDeleted: false
    }).countDocuments()

    res.json({ data: contactPeople, count })
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
  ], async (req, res) => {
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