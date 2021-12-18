const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { likeRelation, clearFilters, calculateSkip, generateOrder }  = require('./lib')

const Industry = require('./../models/Industry');
const Company = require('./../models/Company');

// @route   POST api/industries
// @desc    Create industry
// @access  Private
router.post(
  '/', 
  [
    auth,
    [
      check('name', 'Nazwa jest wymagana').not().isEmpty(),
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body

    try {
      const industry = new Industry({ name })

      await industry.save()
      res.json(industry)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   GET api/industries/all
// @desc    Get all industries (without filter)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const industries = await Industry.find({ isDeleted: false })
    res.json(industries)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   POST api/industries/all
// @desc    Get all industries (with filter)
// @access  Private
router.post('/all', auth, async (req, res) => {
  const { name, order = 'name', orderType = 'asc', page, paginate } = req.body
  
  try {
    let filters = {
      name: likeRelation(name),
    }
    filters = clearFilters(filters)

    const industries = await Industry.find({ isDeleted: false, ...filters }).sort(generateOrder(order, orderType)).skip(calculateSkip(page, paginate)).limit(paginate)
    
    const count = await Industry.find({
      ...filters, 
      isDeleted: false
    }).countDocuments()
    
    res.json({ data: industries, count })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   GET api/industries/:id
// @desc    Gets queried industry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id

  try {
    const industry = await Industry.findById(id)

    if (!industry) {
      return res.status(400).json({ msg: 'Nie znaleziono branży' });
    }

    res.json(industry);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

// @route   PUT api/industries/:id
// @desc    Saves changes to queried industry
// @access  Private
router.put(
  '/:id', 
  [
    auth,
    [
      check('name', 'Nazwa jest wymagana').not().isEmpty(),
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id

    try {
      const industry = await Industry.findByIdAndUpdate(id, req.body, {
        new: true
      })

      if (!industry) {
        return res.status(400).json({ msg: 'Nie znaleziono branży' });
      }

      res.json(industry)
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
)

// @route   DELETE api/industries/:id
// @desc    Deletes queried industry
// @access  Private
router.delete('/:id', auth, async (req,res) => {
  const id = req.params.id
  try {
    let industry = await Industry.findByIdAndUpdate(id, { isDeleted: true }, {
      new: true
    })

    await Company.updateMany({ industry: id }, { isDeleted: true })

    if (!industry) {
      return res.status(400).json({ msg: 'Nie znaleziono branży' });
    }
    res.json(industry)
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

module.exports = router;