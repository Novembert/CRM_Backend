const connectDB = require('./../config/db');
const seedRoles = require('./roles')
const seedUsers = require('./users')
const seedIndustries = require('./industries')

const seed = async () => {
  await connectDB();
  await seedRoles()
  await seedUsers()
  await seedIndustries()
  console.log('FINISHED')
  process.exit()
}

seed()