const { addItems, deleteItems } = require('./lib')
const User = require('./../models/User');
const Company = require('./../models/Company');
const Industry = require('./../models/Industry');

const data = []

const mocks = [
  {
    name: 'Fanex',
    nip: '1111111111',
    address: 'Bolesława Chrobrego 3',
    city: 'Bydgoszcz',
    user: 'amWesolowska',
    industry: 'Gastronomia'
  },
  {
    name: 'Lot',
    nip: '2222222222',
    address: 'Lipcowa 28',
    city: 'Warszawa',
    user: 'nBujny',
    industry: 'Lotnictwo'
  },
  {
    name: 'Opel',
    nip: '3333333333',
    address: 'Krańcowa 59',
    city: 'Łódź',
    user: 'nBujny',
    industry: 'Motoryzacja'
  }
]

async function createMockCompany(params) {
  let obj = {...params}
  obj.user = await User.findOne({ login: params.user })
  obj.industry = await Industry.findOne({ name: params.industry })
  await data.push(obj)
  return obj 
}

const initData = async () => {
  try {
    for (let i = 0; i < mocks.length; i++) {
      await createMockCompany(mocks[i])
    }
  } catch (err) {
    console.log(err)
  }
}

const seedCompanies = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initData()
      // await deleteItems(data, Company, 'Companies', 'name', 0,  ['name'])
      await addItems(data, Company, 'Companies', ['name'])
    } catch (err) {
      console.log(err)
      reject(-1)
    }
    resolve(1)
  })
}

module.exports = seedCompanies