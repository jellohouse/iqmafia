var secrets = require('./config/secrets.js');
const express = require('express');
var bodyParser = require('body-parser')
//const dotenv = require('dotenv');
const path = require('path');

const homeController = require('./controllers/home');

const app = express();

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/', homeController.index);
app.post('/newsletter', homeController.newsletter);
app.get('/postJob', homeController.postJob);
//app.get('/signUp', homeController.signUp);
app.get('/apply/:jobId', homeController.apply);
app.post('/apply/:jobId', homeController.applyPost);
app.get('/success', homeController.success);

app.listen(secrets.port, () => console.log('Gator app listening on port '+secrets.port));
