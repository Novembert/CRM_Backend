const config = require('config');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

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
  }
]

const seedUsers = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initData()
      await deleteUsers()
      await addUsers()
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
  
const deleteUsers =  () => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        const user = await User.findOne({ name: item.name })
        if (user) {
          user.remove()
          console.log(chalk.yellow(`Users: ${item.name} ${item.surname} removed`))
        }
      } catch (err) {
        reject(err)
      }
    }
    resolve(1)
  })
}

const addUsers = async () => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      let user = await new User({
        ...item
      })
      try {
        await user.save()
        console.log(chalk.green(`Users: ${item.name} ${item.surname} created`))
      } catch (err) {
        reject(err)
      }
    }
    resolve(1)
  })
}

module.exports = seedUsers