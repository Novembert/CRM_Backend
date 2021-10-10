const connectDB = require('./../config/db');
const seedRoles = require('./roles')
const seedUsers = require('./users')

const seed = async () => {
  await connectDB();
  await seedRoles()
  await seedUsers()
  console.log('FINISHED')
  process.exit()
}

seed()