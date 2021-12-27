const notion = require('./notion');
const instagram = require('./instagram');
const mediaUtils= require('./utils/media');

const filters = {
  filter: {
    and: [
      {
        property: "Status",
        select: {
          equals: "Publish"
        }
      },
      {
        property: "isLocked",
        checkbox: {
          equals: false
        }
      },
      {
        property: "isScheduled",
        checkbox: {
          equals: false
        }
      }
    ]
  }
};

const newPost = async page => {
  return new Promise(async (resolve, reject) => {
    try {
      const { id } = page;
      let blocks, err;
      [blocks, err] = await notion.getBlocks(id);
      if (err) {
        throw err;
      }

      let notBlocks;
      [notBlocks, err] = await instagram.notion.build(blocks); 
      if (err) {
        throw err;
      }

      // fetch image to disk
      const { media } = notBlocks;
      const allMedia = await Promise.all(
        media.map((m, i) => mediaUtils.fetchImage(m.url, i))
      );

      // append filepath to each respective media object
      allMedia.forEach(([f, err]) => {
        if (err) {
          throw err;
        }
        notBlocks.media[f.index].filepath = f.filepath;
      });

      resolve([{ ...notBlocks, page_id: id }, null]);
    } catch(err) {
      resolve([null, err]);
    }
  });
};

const task = async () => {
  try {
    const [pages, err] = await notion.queryDatabase(filters);
    if (err) {
      return err;
    }
    const { results } = pages;
    if (!results || results.length === 0) {
      return;
    }

    // FIXME not a big fan of this module.expors.# call. But mocking newPost in
    // tests is not possible within this context
    const posts = results.map(page => module.exports.newPost(page));
    const allPosts = await Promise.all(posts);

    // TODO implement scheduling posts

    // publish ready posts to instgram
    let pub = [];
    let i = 0;
    const j = allPosts.length;
    for (; i < j; i++) {
      const [post, err] = allPosts[i];
      if (err) {
        pub.push(Promise.resolve([post, err]));
      } else {
        pub.push(instagram.publish(post));
      }
    }

    const allPub = await Promise.all(pub);
    allPub.forEach(async ([post, err]) => {
      if (err) {
        // TODO update notion page with err (and/or maybe try again?)
        // console.error(err);
      } else {
        const [page, err] = await notion.updatePage(post.page_id, {
          Status: {
            select: {
              name: 'Published'
            }
          },
          isPublished: {
            checkbox: true
          },
          isLocked: {
            checkbox: true
          },
          isScheduled: {
            checkbox: false
          },
          "Publish Date": {
            date: {
              start: new Date((new Date()).toUTCString())
            }
          }
        });
        // if (err) {
        //   console.error('notion.updatePage', err);
        // } else {
        //   console.log('notion.updatePage', 'OK');
        // }
        // console.log(page);
      }
    });

    // TODO email or notify of publish status somehow
    // TODO clean up files (this might not be necessary on heroku, maybe save to
    // tmp for free cleanup?)
  } catch(err) {
    // NOTE a failure here is a CODE LEVEL FAILURE and not a "failure" in a step
    // in the process to publish a page
    return err;
  }

  return;
};

/**
 * expose
 *
 * NOTE some exports are done solely for testing/mock purposes, their exposure
 * is not an intention for direct use.
 */

module.exports = { newPost, task };