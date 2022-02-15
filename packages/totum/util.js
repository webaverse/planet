const path = require('path');
const fs = require('fs');
const url = require('url');
const fetch = require('node-fetch');

const cwd = process.cwd();
module.exports.cwd = cwd;

const resolveFileFromId = (id, importer) => {
  id = id.replace(/^[\/\\]+/, '');
  let match;
  // console.log('load', id, match);
  if (match = id.match(/^ipfs:\/+([a-z0-9]+)((?:\/?[^\/\?]*)*)(\?\.(.+))?$/i)) {
    return `https://ipfs.webaverse.com/ipfs/${match[1]}${match[2]}`;
  } else if (match = id.match(/^\/@proxy\/(.+)$/)) {
    return match[1];
  } else {
    return null;
  }
};
module.exports.resolveFileFromId = resolveFileFromId;

const fetchFileFromId = async (id, importer, encoding = null) => {
  id = id
   .replace(/^\/@proxy\//, '')
   .replace(/^(https?:\/(?!\/))/, '$1/');
  if (/^https?:\/\//.test(id)) {
    const u = url.parse(id, true);
    u.query.noimport = 1 + '';
    id = url.format(u);
    const res = await fetch(id)
    if (encoding === 'utf8') {
      const s = await res.text();
      return s;
    } else {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    }
  } else {
    return await new Promise((accept, reject) => {
      const p = path.join(cwd, id.replace(/^[\/\\]+/, ''));
      // console.log('read dir', {id, importer, p});
      fs.readFile(p, encoding, (err, d) => {
        if (!err) {
          accept(d);
        } else {
          if (err.code === 'ENOENT') {
            accept(null);
          } else {
            reject(err);
          }
        }
      });
    });
  }
};
module.exports.fetchFileFromId = fetchFileFromId;

const fillTemplate = function(templateString, templateVars) {
  return new Function("return `"+templateString +"`;").call(templateVars);
};
module.exports.fillTemplate = fillTemplate;

const createRelativeFromAbsolutePath = path => {
  if (path.startsWith(cwd.replaceAll('\\','/'))) {
    path = path.slice(cwd.length);
  }
  return path;
}
module.exports.createRelativeFromAbsolutePath = createRelativeFromAbsolutePath;