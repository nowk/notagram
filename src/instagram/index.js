const fsp = require("fs/promises");
const client = require('./client');
const notion = require('./notion');

/**
 * publish publishes the post to ig
 * 
 * @param {Object} post 
 * @returns {Promise<Array>} (promise with multi return array)
 */

const publish = async post => {
  const [ig, err] = client.client();
  if (err) {
    return Promise.resolve([post, err]);
  }

  return new Promise(async (resolve, reject) => {
    try {
      const { caption: captionArr, media } = post;

      const caption = captionArr.join('\n');
      let files = [];

      let i = 0;
      const j = media.length;
      for (; i < j; i++) {
        const { filepath, type } = media[i];
        const buf = await fsp.readFile(filepath);
        files.push({ buf, type });
      }

      switch(files.length) {
        case 0:
          throw new Error('No files to post');

        case 1:
          const { buf: file } = files[0];
          await ig.publish.photo({ caption, file });
          break;

        default:
          const items = files.map(f => ({ file: f.buf }));
          await ig.publish.album({ caption, items });
          break;
      }

      resolve([post, null]);
    } catch(err) {
      resolve([post, err]);
    }
  });
};

/**
 * expose
 */

module.exports = { publish, notion };