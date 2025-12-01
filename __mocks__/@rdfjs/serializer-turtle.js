const Sink = require('@rdfjs/sink');

class Serializer extends Sink {
  transform(quads) {
    return quads
      .map((q) => `${q.subject.value} ${q.predicate.value} ${q.object.value} .`)
      .join('\n');
  }
}

module.exports = Serializer;
module.exports.default = Serializer;
