const config = require('config');
const bcrypt = require('bcryptjs');
const { addItems, deleteItems } = require('./lib')

const User = require('./../models/User');
const Role = require('./../models/Role');

const passwords = config.get('passwords')

const data = [
]

const mocks = [
  {
    name: "Norbert",
    surname: "Bujny",
    dateOfBirth: "2000-03-20",
    login: 'nBujny',
    role: 'Pracownik',
    password: passwords[0]
  },
  {
    name: "Jan",
    surname: "Kowalski",
    dateOfBirth: "1995-08-11",
    login: 'jKowalski',
    role: 'Administrator',
    password: passwords[1]
  }
]

const seedUsers = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initData()
      await deleteItems(data, User, 'Users', 'login', 0,  ['login'])
      await addItems(data, User, 'Users', ['login'])
    } catch (err) {
      console.log(err)
      reject(-1)
    }
    resolve(1)
  })
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function createMockUser(params) {
  let obj = {...params}
  obj.password = await hashPassword(params.password)
  obj.role = await Role.findOne({ name: params.role })
  await data.push(obj)
  return obj 
}

const initData = async () => {
  try {
    for (let i = 0; i < mocks.length; i++) {
      await createMockUser(mocks[i])
    }
  } catch (err) {
    console.log(err)
  }
  
}

module.exports = seedUsers