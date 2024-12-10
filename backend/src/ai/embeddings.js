// ai/embeddings.js
const fs = require('fs');
const path = require('path');

// Adjust the path to your embeddings file
const embeddingsFile = path.join(__dirname, 'glove.6B.50d.txt');

const embeddings = new Map();

function loadEmbeddings() {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(embeddingsFile, { encoding: 'utf8' });
    let leftover = '';

    stream.on('data', (chunk) => {
      const lines = (leftover + chunk).split('\n');
      leftover = lines.pop();

      for (const line of lines) {
        const [word, ...vectorValues] = line.split(' ');
        const vector = vectorValues.map(Number);
        embeddings.set(word, vector);
      }
    });

    stream.on('end', () => {
      resolve();
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = {
  embeddings,
  loadEmbeddings,
};
