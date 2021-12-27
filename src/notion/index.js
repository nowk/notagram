const fetch = require("node-fetch");
const { methods } = require('../http');

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2021-08-16';
const { NOTION_DATABASE_ID, NOTION_SECRET } = process.env;

/**
 * check required variables
 */

if (NOTION_DATABASE_ID && NOTION_SECRET) {
  console.info('Environment varialbles', 'OK');
} else {
  throw new Error('Required environment variables are missing');
}

const { GET, POST, PATCH } = methods;

/**
 * headers, base for all other headers
 */

const headers = {
  'Notion-Version': NOTION_API_VERSION,
   Authorization: `Bearer ${NOTION_SECRET}`,
};

/**
 * queryDatabase queries the notion database with any additional filters
 *
 * @param {Object} filters 
 * @param {String} id (optional, if you want to grab something other than the
 *                     one defined in your env vars)
 * @returns {Array} (multi return)
 * @api public
 */

const queryDatabase = async (filters = {}, id = null) => {
  const req = {
    method: POST,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filters)
  };
  try {
    const url = `${NOTION_API}/databases/${id || NOTION_DATABASE_ID}/query`;
    const res = await fetch(url, req);

    return [await res.json(), null];
  } catch(err) {
    return [null, err];
  }
};

/**
 * getBlocks gets the page content, aka blocks
 * 
 * @param {String} id (page id)
 * @param {Number} page_size (number of blocks to return, ie pagination)
 * @returns {Array} (multi return)
 * @api public
 */

const getBlocks = async (id, page_size = 10) => {
  const req = { method: GET, headers };
  try {
    const url = `${NOTION_API}/blocks/${id}/children?page_size=${page_size}`;
    const res = await fetch(url, req);

    return [await res.json(), null];
  } catch(err) {
    return [null, err];
  }
};

/**
 * updatePage updates the page's 'properties'
 * 
 * @param {String} id (page id)
 * @param {Object} properties 
 * @returns {Array} (multi return)
 * @api public
 */

const updatePage = async (id, properties) => {
  const req = {
    method: PATCH,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ properties })
  };
  try {
    const url = `${NOTION_API}/pages/${id}`;
    const res = await fetch(url, req);

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.message);
    }

    return [body, null];
  } catch(err) {
    return [null, err];
  }
};

/**
 * expose
 */

module.exports = { queryDatabase, getBlocks, updatePage };