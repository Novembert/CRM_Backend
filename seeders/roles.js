const Role = require('./../models/Role');
const { addItems, deleteItems } = require('./lib')

const data = [
  {name: 'Administrator'},
  {name: 'Pracownik'},
  {name: 'Moderator'}
]

const seedRoles = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // await deleteItems(data, Role, 'Roles', 'name', 0,  ['name'])
      await addItems(data, Role, 'Roles', ['name'])
    } catch (err) {
      console.log(err)
      reject(err)
    }
    resolve(1)
  })  
}

module.exports = seedRoles