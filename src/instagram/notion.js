
/**
 * build normalizes a notion blocks array structure into the main components for
 * an instagram post, being image(s) and caption. The supported block types are
 * images and paragraphs.
 * 
 * FIXME support additional media types for video
 *
 * @param {Array} blocks (a notion blocks payload)
 * @returns {Array} (multi return array)
 * @api public
 */

const build = blocks => {
  if (!('results' in blocks)) {
    return [null, new Error('no attribute: results')];
  } 

  let caption = [];
  let media = [];

  const { results } = blocks;

  let i = 0;
  const j = results.length;
  for (; i < j; i++) {
    const row = results[i];
    const { type, image, paragraph } = row;
    switch(type) {
      case 'image':
        media.push({ type, url: image.file.url });

        break;

      case 'paragraph':
        caption.push(paragraph.text.map(v => v.plain_text).join(''));

        break;

      default:
        // continue
        break;
    }
  }

  return [{ caption, media }, null];
};

/**
 * expose
 */

module.exports = { build };