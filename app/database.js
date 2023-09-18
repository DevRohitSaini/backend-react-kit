import mongoose from 'mongoose';
import Constants from './config/constants';
const autoIncrement = require('mongoose-auto-increment');

// Use native promises
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// Connect to our mongo database;
// mongoose.connect(Constants.mongo.uri, { useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connection.on('error', (err) => {
//   throw err;
// });

mongoose.connect(Constants.mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to the database!");
}).catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});
autoIncrement.initialize(mongoose.connection);