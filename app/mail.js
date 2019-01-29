const google = require('googleapis');
const gmail = google.gmail('v1');

const SEARCH_QUERY = '(electronic ticket flight) OR (eticket flight)';
const MAX_RESULTS = 3;


/**
 * Get user's email
 */
function getEmailAddress (auth) {
  const options = {
    auth: auth,
    userId: 'me'
  };

  return new Promise((resolve, reject) => {
    gmail.users.getProfile(options, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.emailAddress);
      }
    });
  });
}


/**
 * Get IDs of matched emails
 */
function getMessages (auth) {
  const options = {
    auth: auth,
    userId: 'me',
    q: SEARCH_QUERY,
    maxResults: MAX_RESULTS
  };

  return new Promise((resolve, reject) => {
    gmail.users.messages.list(options, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.messages);
      }
    });
  });
}


/**
 * Get IDs of attached files
 */
function getAttachmentsOfMessage (auth, message) {
  const options = {
    auth: auth,
    userId: 'me',
    id: message.id
  };

  return new Promise((resolve, reject) => {
    gmail.users.messages.get(options, async (err, response) => {
      if (err) {
        reject(err);
      } else {
        const attachedFiles = [];

        for (let part of response.payload.parts) {
          if (part.mimeType === 'application/pdf') {
            const attachmentId = part.body.attachmentId;
            const messageId = message.id;
            const filename = part.filename;
            const file = await getAttachedFile({ auth, messageId, attachmentId });
            attachedFiles.push({ filename, file });
          }
        }

        resolve(attachedFiles);
      }
    });
  });
}


/**
 * Get single raw file
 */
function getAttachedFile ({ auth, messageId, attachmentId }) {
  const options = {
    auth: auth,
    id: attachmentId,
    messageId: messageId,
    userId: 'me'
  };

  return new Promise((resolve, reject) => {
    gmail.users.messages.attachments.get(options, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(Buffer.from(response.data, 'base64'));
      }
    });
  });
}


module.exports = {
  getEmailAddress,
  getMessages,
  getAttachmentsOfMessage
};
