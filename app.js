const express = require('express');
const app = express();
const routes = require('./routes');

// Connecting routes to application
app.use('/', routes);

// Turn server on
app.listen(3000, () => {
  console.log("App listening on port 3000")
})
