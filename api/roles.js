const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Role = require('../models/Role');

// @route   GET api/roles
// @desc    Get all roles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.find()

    res.json(roles)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
})

module.exports = router