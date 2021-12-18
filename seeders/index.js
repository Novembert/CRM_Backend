const connectDB = require('./../config/db');
const seedRoles = require('./roles')
const seedUsers = require('./users')
const seedIndustries = require('./industries')
const seedCompanies = require('./companies')
const seedContactPeople = require('./contactPeople')
const seedNotes = require('./notes')
const chalk = require('chalk');

const dropCollections = (connection) => {
  return new Promise(async (resolve, reject) => {
    await connection.connection.db.listCollections().toArray(async function(err, names) {
      for (i = 0; i < names.length; i++) {
        let name = names[i].name
        await connection.connection.db.dropCollection(names[i].name, function(err, res) {
          if (err) {
            console.log(err)
            reject(-1)
          }
          console.log(chalk.yellow(`${name} dropped`))
        })
      }
      resolve(1)
    })
  })
}

const seed = async () => {
  const connection = await connectDB();
  await dropCollections(connection)
  await seedRoles()
  await seedUsers()
  await seedIndustries()
  await seedCompanies()
  await seedContactPeople()
  await seedNotes()
  console.log('FINISHED')
  process.exit()
}

seed()