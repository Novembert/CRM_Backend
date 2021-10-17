const express = require('express');
const connectDB = require('./config/db');

const app = express()

require('./models/User');
require('./models/Role');
require('./models/Company');
require('./models/Industry');
require('./models/ContactPerson');
require('./models/Note');

connectDB();

app.use(express.json({ extended: false }));

app.use('/api/auth', require('./api/auth'));
app.use('/api/users', require('./api/users'));
app.use('/api/industries', require('./api/industries'));
app.use('/api/companies', require('./api/companies'));
app.use('/api/contact-persons', require('./api/contactPersons'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

module.exports = app;