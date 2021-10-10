const Role = require('./../models/Role');
const chalk = require('chalk');

const data = ['Administrator', 'Pracownik']

const seedRoles = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await deleteRoles()
      await addRoles()
    } catch {
      reject(-1)
    }
    resolve(1)
  })  
}

const deleteRoles = () => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        const role = await Role.findOne({ name: item })
        if (role) {
          role.remove()
          console.log(chalk.yellow(`Roles: ${item} removed`))
        }
      } catch (err) {
        console.log(err)
        reject(-1)
      }
    }
    resolve(1)
  })
}

const addRoles = async () => { 
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      let role = await new Role({
        name: item
      })
      try {
        await role.save()
        console.log(chalk.green(`Roles: ${item} created`))
      } catch (err) {
        reject(err)
      }
    }
    resolve(1)
  })
}

module.exports = seedRoles