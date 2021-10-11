const { addItems } = require('./lib')

const User = require('./../models/User');
const Company = require('./../models/Company');
const Note = require('./../models/Note')

const data = []

const mocks = [
  {
    content: 'Testowa notatka w firmie Fanex. Proszę kupić sos meksykański do żabek.',
    company: 'Fanex',
    user: 'amWesolowska'
  },
  {
    content: 'Proszę zmienić nazwę sosu paprykowego ostrego na "Paprykowy ostry".',
    company: 'Fanex',
    user: 'amWesolowska'
  },
  {
    content: 'Testowa notatka w firmie Opel. Należy wynegocjować niższe ceny leasingu.',
    company: 'Opel',
    user: 'nBujny'
  },
  {
    content: 'Cel: załatwić loty rejsowe z Poznania do Trogiru.',
    company: 'Lot',
    user: 'nBujny'
  }
]

async function createMockNote(params) {
  let obj = {...params}
  obj.user = await User.findOne({ login: params.user })
  obj.company = await Company.findOne({ name: params.company })
  await data.push(obj)
  return obj 
}


const initData = async () => {
  try {
    for (let i = 0; i < mocks.length; i++) {
      await createMockNote(mocks[i])
    }
  } catch (err) {
    console.log(err)
  }
}

const seedNotes = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await initData()
      // await deleteItems(data, Company, 'Companies', 'name', 0,  ['name'])
      await addItems(data, Note, 'Notes', ['content'])
    } catch (err) {
      console.log(err)
      reject(-1)
    }
    resolve(1)
  })
}

module.exports = seedNotes