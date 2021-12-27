const sinon = require('sinon');
const { assert } = require('chai');

const client = require('./instagram/client');
const notion = require('./notion');
const instagram = require('./instagram');
const media = require('./utils/media');
const notagram = require('.');

describe('notagram', () => {
  beforeEach(() => {
    const session = { publish: { photo: () => {}, album: () => {} } };
    sinon.stub(client, 'client').returns([session, null]);
    sinon.stub(instagram, 'publish').returns([{}, null]);
    sinon.stub(notion, 'updatePage').returns([{}, null]);
  });

  afterEach(() => {
    sinon.restore();
  });

  context('#task', () => {
    it('queries the notion database', async () => {
      const mock = sinon.mock(notion);
      mock.expects('queryDatabase')
        .once()
        .withArgs(sinon.match.object)
        .returns([{ results: [] }, null]);

      await notagram.task();

      mock.verify();
    });

    it(
      'retrieves and processes each page received from the database',
      async () => {

      const results = [{ id: 'abcdhashprobably' }, { id: 'anotherhashyeups' }];
      sinon.stub(notion, 'queryDatabase').returns([{ results }, null]);

      const mock = sinon.mock(notagram)
      mock.expects('newPost')
        .twice()
        .withArgs(sinon.match.object)
        .returns(Promise.resolve([{}, null]));

      await notagram.task();

      mock.verify();
    });

    it('publishes all successful posts to instgram', async () => {
      const results = [{ id: 'abcdhashprobably' }, { id: 'anotherhashyeups' }];
      sinon.stub(notion, 'queryDatabase').returns([{ results }, null]);
      sinon.stub(notagram, 'newPost')
        .onFirstCall()
        .returns(Promise.resolve([{}, null]))
        .onSecondCall()
        .returns(Promise.resolve([{}, null]));

      instagram.publish.restore();
      const mock = sinon.mock(instagram);
      mock.expects('publish')
        .twice()
        .withArgs(sinon.match.object)
        .returns(Promise.resolve([{}, null]));

      await notagram.task();

      mock.verify();
    });

    it.skip('returns the number of posts affected in the current call');

    context('-', () => {
      beforeEach(() => {
        sinon.useFakeTimers(new Date(2021, 01, 29));
      });

      it(
        'updates the pages status for each successful publish to instagram',
        async () => {

        const results = [{ id: 'abcdhashprobably' }, { id: 'anotherhashyeups' }];
        sinon.stub(notion, 'queryDatabase').returns([{ results }, null]);
        sinon.stub(notagram, 'newPost')
          .onFirstCall()
          .returns(Promise.resolve([{}, null]))
          .onSecondCall()
          .returns(Promise.resolve([{}, null]));

        instagram.publish.restore();
        sinon.stub(instagram, 'publish')
          .onCall(0)
          .returns(Promise.resolve([{ page_id: 'abcd123' }, null]))
          .onCall(1)
          .returns(Promise.resolve([{ page_id: 'efgh456' }, null]));

        notion.updatePage.restore();
        const mock = sinon.mock(notion);
        mock.expects('updatePage')
          .twice()
          .withArgs(sinon.match.string, {
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
                start: new Date('2021-03-01T05:00:00.000Z')
              }
            }
          })
          .returns([{}, null]);

        await notagram.task();

        mock.verify();
      });
    });
  });

  context('#newPost', () => {
    let page, results;

    beforeEach(() => {
      page = {
        id: 'somehashvalueprobably'
      };
      results = [
        { type: 'image', image: { file: { url: 'http://file/1' } } },
        { type: 'image', image: { file: { url: 'http://file/2' } } }
      ];
    })

    it('gets blocks data from notion', async () => {
      const mock = sinon.mock(notion);
      mock.expects('getBlocks')
        .once()
        .withArgs(page.id);

      await notagram.newPost(page);

      mock.verify();
    });

    it('"builds" returned blocks data', async () => {
      sinon.stub(notion, 'getBlocks').returns([{ results: [] }, null]);

      const mock = sinon.mock(instagram.notion);
      mock.expects('build')
        .once()
        .withArgs(sinon.match.object)
        .returns([{ media: [] }, null]);

      await notagram.newPost(page);

      mock.verify();
    });

    it('calls fetchImage to grab media from source', async () => {
      sinon.stub(notion, 'getBlocks').returns([{ results }, null]);

      const mock = sinon.mock(media);
      mock.expects('fetchImage')
        .twice()
        .withArgs(sinon.match.string, sinon.match.number)
        .returns([{}, null]);

      await notagram.newPost(page);

      mock.verify();
    });


    it('returns final post payload with updated media array', async () => {
      sinon.stub(notion, 'getBlocks').returns([{ results }, null]);
      sinon.stub(media, 'fetchImage')
        .onCall(0)
        .returns([{ index: 0, filepath: '/file/1/path' }, null])
        .onCall(1)
        .returns([{ index: 1, filepath: '/file/2/path' }, null]);

      const [postData, err] = await notagram.newPost(page);
      if (err) {
        assert.fail(`Unexpected error: ${err}`);
      }
      assert.deepEqual(postData, {
        page_id: 'somehashvalueprobably',
        caption: [],
        media: [
          {
            type: 'image',
            url: 'http://file/1',
            filepath: '/file/1/path'
          },
          {
            type: 'image',
            url: 'http://file/2',
            filepath: '/file/2/path'
          }
        ]
      });
    });

    it.skip('errs on broken file');
  });
});