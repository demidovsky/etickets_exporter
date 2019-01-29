const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = `http://${process.env.HOST || 'localhost'}:1234/personal`;

console.log(process.env.HOST || 'localhost');

/**
 * Auth client
 */
function getOAuthClient () {
  return new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
}


/**
 * Loggin' in
 */
function getAuthUrl () {
  const auth = getOAuthClient();

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/devstorage.read_write'
  ];

  const url = auth.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  return url;
}


module.exports = {
  getOAuthClient,
  getAuthUrl
};
