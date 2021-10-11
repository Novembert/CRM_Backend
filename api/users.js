const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('./../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('email', 'Proszę podać prawidłowy email').isEmail(),
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

    const { email, password, name, surname } = req.body;

    try {
      //check if the user already exists
      if (await checkForExistingUserByEmail(email)) {
        return res.status(400).json({
          errors: [{ msg: 'Użytkownik z podanym emailem już istnieje' }]
        });
      }

      let user = new User({
        email,
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

async function checkForExistingUserByEmail(email) {
  const user = await User.findOne({ email });
  if (user) {
    return true;
  } else return false;
}

async function hashPassword(password) {
  const salt = await bcrytp.genSalt(10);
  return await bcrytp.hash(password, salt);
}

module.exports = router;