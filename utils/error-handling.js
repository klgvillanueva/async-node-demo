// define errors object
const errors = {
  dbConnection: (err, approachName) =>
    console.log(`${approachName}: DB CONNECTION ERROR: ${err.message}`),
  dbCreate: (err, approachName) =>
    console.log(`${approachName}: DB CREATE ARTICLE ERROR: ${err.message}`),
  fs: (err, approachName) =>
    console.log(`${approachName}: FILE SYSTEM ERROR: ${err.message}`),
};

// define function to invoke either error handler
// specified in errors obj or generic error function
function errorDispatch(info, approachName = 'UNKNOWN APPROACH') {
  if (errors.hasOwnProperty(info.type))
    return errors[info.type](info.err, approachName);
  else return console.log(`${approachName}: UNIDENTIFIED ERROR: ${info}`);
}

module.exports = errorDispatch;
