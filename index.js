// Used as entry for development server only
process.env.NODE_ENV = process.env.NODE_ENV;

require('@babel/register');
require('./app');
