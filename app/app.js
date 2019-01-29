const http = require('http');
const path = require('path');
const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const crypto = require('crypto');

const { getOAuthClient, getAuthUrl } = require('./authorization');
const { getEmailAddress, getMessages, getAttachmentsOfMessage } = require('./mail');
const storage = require('./storage');

const PORT = 1234;
const app = express();


/**
 * Setting session
 */
app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: true,
  saveUninitialized: true
}));


/**
 * Serving static assets
 */
app.use(express.static('public'));


/**
 * Serving templates
 */
// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', path.join(process.cwd(), 'views'));


/**
 * Authorization callback
 */
app.use('/personal', function (req, res) {
  const auth = getOAuthClient();
  const session = req.session;
  const code = req.query.code;

  auth.getToken(code, function (err, tokens) {
    if (!err) {
      auth.credentials = tokens;
      session['tokens'] = tokens;
      res.render('personal', {
        success: true
      });
    } else {
      res.render('personal', {
        success: false,
        url: getAuthUrl()
      });
    }
  });
});


/**
 * Processing files
 */
app.use('/doit', async function (req, res) {
  const auth = getOAuthClient();
  auth.credentials = req.session['tokens'];

  try {
    const email = await getEmailAddress(auth);

    const messages = await getMessages(auth);
    console.log('Matched messages:\n', messages);

    const filenames = [];

    for (let message of messages) {
      const attachments = await getAttachmentsOfMessage(auth, message);

      for (let attachment of attachments) {
        const filepath = `${email}/${attachment.filename}`;
        await storage.upload(filepath, attachment.file);

        // for html output:
        filenames.push({
          filename: attachment.filename,
          url: `https://storage.cloud.google.com/${storage.BUCKET_NAME}/${filepath}`
        });
      }
    }

    console.log('Finished.');
    res.render('result', {
      success: true,
      filenames: filenames
    });
  } catch (err) {
    console.log(err);
    res.render('result', {
      success: false
    });
  }
});


/**
 * Home
 */
app.use('/', function (req, res) {
  res.render('index', {
    url: getAuthUrl()
  });
});


const server = http.createServer(app);
server.listen(PORT);
server.on('listening', function () {
  console.log(`Server listening to port ${PORT}.`);
});

