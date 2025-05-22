module.exports = function(array) {
  var readable = new (require('stream').Readable)({ objectMode: true });
  readable._read = function(size) {
    if (array.length) {
      readable.push(array.shift(size));
    }
    if (!array.length) {
      readable.push(null);
    }
  };
  return readable;
};

