module.exports = (app) => {
    app.use((req, res, next) => {
      // this middleware runs whenever requested page is not available
      res.status(404).json({ errorMessage: 'This route does not exist' });
    });
  
    app.use((err, req, res, next) => {
      // whenever you call next(err), this middleware will handle the error
      res.status(err.status).json({ errorMessage: err.message });
    });
  };