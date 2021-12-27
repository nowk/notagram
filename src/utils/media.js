const path = require("path");
const fetch = require("node-fetch");
const uudi = require("uuid/v4");
const sharp = require("sharp");
const appDir = path.dirname(require.main.filename);

/**
 * fetchImage saves image from url to file
 * 
 * @param {String} url 
 * @param {Number} index (for index to know order in array)
 * @returns {Promise<Object>}
 * @api public
 */

const fetchImage = async (url, index = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      const filename = `${uudi()}.jpg`;
      const filepath = `${appDir}/media/${filename}`;

      sharp(buf)
        .resize({
          width: 1080,
          height: 1080,
          position: 'right top',
          fit: 'cover' 
        })
        .jpeg({ mozjpeg: true })
        .toFile(filepath, (err, info) => {
          if (err) {
            throw err;
          }

          resolve([{ filepath, index }, null]);
        });
    } catch (err) {
      reject([url, err]);
    }
  });
};

/**
 * expose
 */

module.exports = { fetchImage }
