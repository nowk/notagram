const ipa = require("instagram-private-api");

/**
 * igClient
 */

const igClient = new ipa.IgApiClient();

/**
 * session is the active instagram logged in client
 */

let session;

/**
 * IG credentials from env vars
 */

const { IG_USERNAME, IG_PASSWORD } = process.env;

if (!IG_USERNAME || !IG_PASSWORD) {
  throw new Error('Instagram Credentials Required');
}

/**
 * login creats a logged in instagram connection
 * 
 * @returns {Error} (if error)
 * @api public
 */

const login = async () => {
  if (session) {
    console.info(
      'There is currently an active instagram session, skipping login.'
    );
    return;
  }
  try {
    igClient.state.generateDevice(IG_USERNAME);
    await igClient.account.login(IG_USERNAME, IG_PASSWORD);

    session = igClient;
  } catch (err) {
    session = null;

    return err;
  }

  return;
};

/**
 * client returns the current sesion
 * 
 * @returns {Array} (multi return)
 * @api public
 */

const client = () => {
  if (!session) {
    return [null, new Error('You must be logged into instagram.')];
  }

  return [session, null];
};

/**
 * expose
 */

module.exports = { login, client };
