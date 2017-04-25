// BASE SETUP
// ====================================

// call the packages we need
const express = require('express');       // call express
const app = express();                    // define our app using express
const bodyParser = require('body-parser');

// authentication
const cors = require('cors');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const VEGETABLES_COLLECTION = "vegetable";   // mongodb collection

// create a database variable outside of the database connection callback to reuse
var db;

// configure app to use bodyParser()
// this will let us get the data from a POST
// configure app to user cors
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

// authentication check
const authCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    ratelimit: true,
    jwksRequestsPerMinute: 5,
    // YOUR-AUTH0-DOMAIN name e.g. prosper.auth0.com
    jwksUri: ""
  })
})

// connect to the database before starting the application server.
mongodb.MongoClient.connect('mongodb://localhost:27017/gardenPlanner' , function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // save database object from the callback for reuse
  db = database;
  console.log(db.collection(VEGETABLES_COLLECTION))
  console.log("Database connection ready");

  // START THE SERVER
  // ====================================
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;     // set our port
    console.log('Magic happens on port ' + port);
  });
})

// ROUTES FOR OUR API
// ====================================

/*

var router = express.Router();            // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:3000/api)
router.get('/', function(req,res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES ---------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

 */

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  '/api/vegetables'
 *    GET: finds all vegetables
 *    POST: creates a new vegetable
 */


app.get('/api/vegetables', function(req, res) {
  db.collection(VEGETABLES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get vegetables.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post('/api/vegetables', function(req, res) {
  var newVegetable = req.body;

  if (!req.body.name) {
    handleError(res, "Invalid user input", "Must provide a name.", 400);
  }

  db.collection(VEGETABLES_COLLECTION).insertOne(newVegetable, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new vegetable.");
    } else {
      res.status(200).json(doc.ops[0])
    }
  });
});

/*  '/api/vegetables/:id'
 *    GET: find vegetable by id
 *    PUT: update vegetable by id
 *    DELETE: deletes vegetable by id (rarely used)
*/

app.get('/api/vegetables/:id', function(req, res) {
  db.collection(VEGETABLES_COLLECTION).findOne({_id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get vegetable");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put('/api/vegetables/:id', function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(VEGETABLES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update vegetable");
    } else {
      res.status(200).json(updateDoc)
    }
  })
});

app.delete('/api/vegetables/:id', function(req, res) {
  db.collection(VEGETABLES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete vegetable");
    } else {
      res.status(200).json(req.params.id);
    }
  })
});
