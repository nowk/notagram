const { assert } = require('chai');
const notion = require('./notion');

describe('build', () => {
  it('flattens blocks data into a caption and media payload', () => {
    const [data] = notion.build({
      results: [
        {
          type: 'image',
          image: {
            file: {
              url: 'http://url.to/image/1'
            }
          }
        },
        {
          type: 'image',
          image: {
            file: {
              url: 'http://url.to/image/2'
            }
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                plain_text: 'Hello '
              }
            ]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                plain_text: 'world'
              },
              {
                type: 'text',
                plain_text: '!'
              }
            ]
          }
        }
      ]
    });

    assert.deepEqual(data, {
      caption: [
        'Hello ',
        'world!'
      ],
      media: [
        {
          type: 'image',
          url: 'http://url.to/image/1'
        },
        {
          type: 'image',
          url: 'http://url.to/image/2'
        }
      ]
    });
  });

  it('real world data test', () => {
    const [data] = notion.build(require('../../data/blocks.json'));

    assert.deepEqual(data, {
      caption: [
        '',
        '2021-12-22, USDJPY seems to be in the wave 5 on the primary degree, viewable on the Monthly t/f. Intermediate and minor degrees, Daily and 4h t/f respectively, show movement into the 3rd wave for their respective degrees.  Though, the 5 wave of minute (and wave 1 of higher degree), 4h t/f,  are estimations and may not be complete as of yet.',
        '#usdjpy #forex #elliottwave #technicalanalysis',
        ''
      ],
      media: [
        {
          type: 'image',
          url: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/8a8742d7-188d-462e-bcff-b923e2119567/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211223%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211223T222243Z&X-Amz-Expires=3600&X-Amz-Signature=6a81e4c88bf88d40f2702b091d887a4f7079ed9c29d962bdad13a157ffff3fca&X-Amz-SignedHeaders=host&x-id=GetObject'
        },
        {
          type: 'image',
          url: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/486ec00b-0624-4593-ae72-a22df9285880/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211223%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211223T222243Z&X-Amz-Expires=3600&X-Amz-Signature=073f817492844495f2fef9f14893ea10b26dc5de457c3a8e9e75c80cfaa01c97&X-Amz-SignedHeaders=host&x-id=GetObject'
        },
        {
          type: 'image',
          url: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/fde0d885-7f08-4ac0-99e9-db08abbecfda/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211223%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211223T222243Z&X-Amz-Expires=3600&X-Amz-Signature=83e8df223f87b3411db8fee9817439a7110afaf2ea5ff7ac8a1514a5222be7ff&X-Amz-SignedHeaders=host&x-id=GetObject'
        }
      ]
    });
  });
});