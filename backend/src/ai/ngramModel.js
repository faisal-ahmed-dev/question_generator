// ai/ngramModel.js
function buildNgramModel(corpus, n = 3) {
    const ngrams = {};
    const tokens = corpus.split(/\s+/);
  
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n - 1).join(' ');
      const nextWord = tokens[i + n - 1];
      if (!ngrams[gram]) {
        ngrams[gram] = [];
      }
      ngrams[gram].push(nextWord);
    }
  
    return ngrams;
  }
  
  module.exports = { buildNgramModel };
  