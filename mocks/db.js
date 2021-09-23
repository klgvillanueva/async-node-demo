/* eslint-disable nonblock-statement-body-position */
/* eslint-disable curly */
module.exports = {
  connect: (dburl, cb) => {
    setTimeout(() => {
      if (dburl === 'error')
        return cb({
          err: 'an error occurred',
          message: 'an error occurred connecting to db',
        });
      return cb(null, 'successfully connected to db');
    }, 1000);
  },
  create: (data, cb, err = false) => {
    setTimeout(() => {
      if (err)
        return cb({
          err: 'an error occurred',
          message: 'an error occurred saving data',
        });
      return cb(null, { ...data, _id: 'faw0e9fu0293rj03f934f039j4fj' });
    }, 2000);
  },
};
