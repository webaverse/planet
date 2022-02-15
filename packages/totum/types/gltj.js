const path = require('path');
const fs = require('fs');
const {fillTemplate, createRelativeFromAbsolutePath} = require('../util.js');

const templateString = fs.readFileSync(path.join(__dirname, '..', 'type_templates', 'gltj.js'), 'utf8');
const cwd = process.cwd();

module.exports = {
  load(id) {

    id = createRelativeFromAbsolutePath(id);
    
    // console.log('load glbb', id);
    const code = fillTemplate(templateString, {
      srcUrl: id,
    });
    return {
      code,
      map: null,
    };
  },
};