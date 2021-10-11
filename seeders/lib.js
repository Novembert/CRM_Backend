const chalk = require('chalk');

exports.addItems = (data, model, modelName, template = []) => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        let newItem = await new model({
          ...item
        })
        await newItem.save()
        console.log(chalk.green(generateTemplate(item, modelName, template, 'created')))
      } catch (err) {
        reject(err)
      }
    }
    resolve(1)
  })
}

exports.deleteItems = (data, model, modelName, searchBy, searchIndex, template = []) => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        const itemToDel = await model.findOne({ [searchBy]: item[template[searchIndex]] })
        if (itemToDel) {
          itemToDel.remove()
          console.log(chalk.yellow(generateTemplate(item, modelName, template, 'removed')))
        }
      } catch (err) {
        reject(err)
      }
    }
    resolve(1)
  })
}

const generateTemplate = (item, modelName, template, mode) => {
  if (template == []) {
    return `${modelName}: ${item} ${mode}`
  } else {
    let tempString = ''
    for (let i = 0; i < template.length; i++) {
      tempString += item[template[i]] + ' '
    }
    return `${modelName}: ${tempString}${mode}`
  }
}