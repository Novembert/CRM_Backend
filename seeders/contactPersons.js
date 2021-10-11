const { addItems } = require('./lib')

const User = require('./../models/User');
const Company = require('./../models/Company');
const ContactPerson = require('./../models/ContactPerson')

const data = []

const mocks = [
  {
    name: 'Piotr',
    surname: 'Piotrowski',
    phone: '+48 515 830 648',
    user: 'nBujny',
    company: 'Fanex',
    position: 'Szef'
  },
  {
    name: 'Agata',
    surname: 'Dawidowicz',
    phone: '+48 638 223 552',
    user: 'amWesolowska',
    company: 'Lot',
    position: 'Kierownik'
  },
  {
    name: 'Ferdynand',
    surname: 'Magiera',
    phone: '+1 222 334 123',
    user: 'nBujny',
    company: 'Opel',
    position: 'Kucharz'
  },
]

async function createMockContactPerson(params) {
  let obj = {...params}
  obj.user = await User.findOne({ login: params.user })
  obj.company = await Company.findOne({ name: params.company })
  await data.push(obj)
  return obj 
}

const initData = async () => {
  try {
    for (let i = 0; i < mocks.length; i++) {
      await createMockContactPerson(mocks[i])
    }
  } catch (err) {
    console.log(err)
  }
}

const seedContactPersons = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initData()
      // await deleteItems(data, Company, 'Companies', 'name', 0,  ['name'])
      await addItems(data, ContactPerson, 'ContactPersons', ['name', 'surname'])
    } catch (err) {
      console.log(err)
      reject(-1)
    }
    resolve(1)
  })
}

module.exports = seedContactPersons