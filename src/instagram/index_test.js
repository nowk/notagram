const sinon = require('sinon');
const { Buffer } = require('buffer');
const fsp = require('fs/promises');

const client = require('./client');
const instagram = require('.');

describe('instagram', () => {
  let postData;

  beforeEach(() => {
    postData = {
      caption: [
        'Hello ',
        'World!'
      ],
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
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('publish', () => {
    it.skip('gets the current ig client sesion');
    it.skip('returns an error if there are no media to post');

    context('---', () => {
      let session;

      beforeEach(() => {
        session = { publish: { photo: () => {}, album: () => {} } };
        sinon.stub(client, 'client').returns([session, null]);
      });
      
      it('reads medias to buffer', async () => {
        const post = postData;

        const mock = sinon.mock(fsp);
        mock.expects('readFile')
          .twice()
          .withArgs(sinon.match.string)
          .returns(Buffer.from('filebuffer'));

        await instagram.publish(post);

        mock.verify();
      });

      it('publishes a single image', async () => {
        const post = {
          ...postData,
          media: [postData.media[0]]
        };
        const buf = Buffer.from('afile');
        sinon.stub(fsp, 'readFile').returns(buf);

        const mock = sinon.mock(session.publish);
        mock.expects('photo')
          .once()
          .withArgs({ caption: post.caption.join('\n'), file: buf });

        await instagram.publish(post);

        mock.verify();
      });

      it('publishes a multiple images', async () => {
        const post = postData;
        const buf1 = Buffer.from('afile1');
        const buf2 = Buffer.from('afile2');
        sinon.stub(fsp, 'readFile')
          .onCall(0)
          .returns(buf1)
          .onCall(1)
          .returns(buf2);

        const mock = sinon.mock(session.publish);
        mock.expects('album')
          .once()
          .withArgs({
            caption: post.caption.join('\n'),
            items: [
              { file: buf1 },
              { file: buf2 }
            ]
          });

        await instagram.publish(post);

        mock.verify();
      });
    });
  });
});