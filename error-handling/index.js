module.exports = (app) => {
    app.use((req, res) => {
      res.status(404).json({ errorMessage: 'This route does not exist' });
    });
  
    app.use((err, req, res) => {
      res.status(err.status).json({ errorMessage: err.message });
    });
  };