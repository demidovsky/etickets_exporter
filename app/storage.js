const Storage = require('@google-cloud/storage');
const Duplex = require('stream').Duplex;
const path = require('path');

require('dotenv').config();

const PROJECT_ID = process.env.PROJECT_ID;
const BUCKET_NAME = process.env.BUCKET_NAME;
const KEYFILENAME = path.join(process.cwd(), 'key.json');


const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEYFILENAME
});


/**
 * Allows file streaming
 */
function bufferToStream (buffer) {
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}


/**
 * Gets the bucket (creates it if not yet)
 */
function getBucket (BUCKET_NAME) {
  return new Promise(async (resolve, reject) => {
    try {
      const bucketsInfo = await storage.getBuckets();
      const bucketsNames = bucketsInfo[0].map(item => item.id);

      if (bucketsNames.indexOf(BUCKET_NAME) === -1) {
        await storage.createBucket(BUCKET_NAME);
      }

      resolve(storage.bucket(BUCKET_NAME));
    } catch (err) {
      reject(err);
    }
  });
}


/**
 * Sending file to storage
 */
function upload (filename, buffer) {
  return new Promise(async (resolve, reject) => {
    let bucket;

    try {
      bucket = await getBucket(BUCKET_NAME);
    } catch (err) {
      reject(err);
    }

    const file = bucket.file(filename);

    bufferToStream(buffer)
      .pipe(file.createWriteStream())
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .on('finish', (result) => {
        console.log(`uploaded ${filename}`);
        resolve(`uploaded ${filename}`);
      });
  });
}


module.exports = {
  upload,
  BUCKET_NAME
};
