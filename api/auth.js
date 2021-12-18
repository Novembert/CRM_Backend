const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const User = require('./../models/User');

// @route   GET api/auth
// @desc    Get loggged in user data 
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
});

// @route   POST api/auth
// @desc    Login user route
// @access  Public
router.post(
  '/',
  [
    check('password', 'Hasło jest wymagane').not().isEmpty(),
    check('login', 'Login jest wymagany').not().isEmpty(),
  ],
  async (req, res) => {
    //handling errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password } = req.body

    try {
      const user = await User.findOne({ login }).populate({model: 'Role', path: 'role' })

      if (!user) {
        return res
          .status(401)
          .json({ errors: [{ msg: 'Nieprawidłowe dane logowania' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: 'Nieprawidłowe dane logowania' }] });
      }
      const tokenPayLoad = { user: { id: user.id, role: user.role.name } };
      jwt.sign(
        tokenPayLoad,
        config.get('jwtSecret'),
        { expiresIn: 7200 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch {
      console.error(error.message);
      res.status(500).json({ msg: 'Błąd serwera' });
    }
  }
)

module.exports = router;