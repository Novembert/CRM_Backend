const Industry = require('./../models/Industry');
const { addItems, deleteItems } = require('./lib')

const data = [
  {name: 'Informatyka'},
  {name: 'Budownictwo'},
  {name: 'Motoryzacja'},
  {name: 'Lotnictwo'},
  {name: 'Gastronomia'}
]

const seedIndustries = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await deleteItems(data, Industry, 'Industries', 'name', 0,  ['name'])
      await addItems(data, Industry, 'Industries', ['name'])
    } catch (err) {
      console.log(err)
      reject(err)
    }
    resolve(1)
  })  
}

module.exports = seedIndustries