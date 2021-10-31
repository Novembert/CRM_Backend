const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose')
const { likeRelation, clearFilters, calculateSkip, generateOrder }  = require('./lib')
const { check, validationResult } = require('express-validator');

const Company = require('../models/Company');
const Note = require('../models/Note')
const ContactPerson = require('../models/ContactPerson')
const Industry = require('../models/Industry');
const User = require('../models/User');

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

// @route   POST api/companies/all
// @desc    Gets all companies (with filter)
// @access  Private
router.post('/all', auth, async (req, res) => {
  const { name, nip, address, user, city, industry, page, paginate, order = 'name', orderType = 'asc' } = req.body

  try {
    let filters = {
      name: likeRelation(name), 
      nip: likeRelation(nip), 
      address: likeRelation(address), 
      city: likeRelation(city),
      industry,
      user
    }
    filters = clearFilters(filters)

    let aggregation = [
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
      { "$sort": generateOrder(order, orderType)},
      { "$skip": calculateSkip(page, paginate)},
      { "$limit": paginate},
      { "$project": { 
        "user.name": 1,
        "user.surname": 1,
        'name': 1,
        'nip': 1,
        'address': 1,
        'city': 1,
        'industry.name': 1,
      }}
    ]

    if (filters.industry) {
      aggregation.splice(-4, 0, { "$match": { "industry._id": new mongoose.Types.ObjectId(filters.industry)}})
    }
    if (filters.user) {
      aggregation.splice(-4, 0, { "$match": { "user._id": new mongoose.Types.ObjectId(filters.user)}})
    }

    const companies = await Company.aggregate(aggregation)
    const count = await Company.find({
      ...filters, 
      isDeleted: false
    }).countDocuments()

    res.json({ data: companies, count })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

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

// @route   POST api/companies/:id/notes
// @desc    Gets queried company notes (with filter)
// @access  Private
router.post('/:id/notes', auth, async (req, res) => {
  const id = req.params.id
  const { date, order = 'createdAt', orderType = 'desc', page, paginate } = req.body

  try {
    let filters = {
      date
    }
    filters = clearFilters(filters)

    const notes = await Note.find({ company: id, isDeleted: false, ...filters }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)
    const count = await Note.find({
      ...filters, 
      company: id,
      isDeleted: false
    }).countDocuments()

    res.json({ data: notes, count })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   POST api/companies/:id/contact-persons
// @desc    Gets queried company notes (with filter)
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

    const notes = await ContactPerson.find({ company: id, isDeleted: false, ...filters }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)
    
    const count = await ContactPerson.find({
      ...filters, 
      company: id,
      isDeleted: false
    }).countDocuments()

    res.json({ data: notes, count })
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
// @access  Private
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