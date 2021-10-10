const connectDB = require('./../config/db');
const seedRoles = require('./roles')
const seedUsers = require('./users')
const seedIndustries = require('./industries')
const seedCompanies = require('./companies')

const seed = async () => {
  await connectDB();
  await seedRoles()
  await seedUsers()
  await seedIndustries()
  await seedCompanies()
  console.log('FINISHED')
  process.exit()
}

seed()