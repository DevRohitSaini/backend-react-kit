import express from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import morgan from 'morgan';
import helmet from 'helmet';
import routes from './routes';
import Constants from './config/constants';
import paginate from 'express-paginate';

const app = express();

// 10 results returned per page
// 50 number of results returned to per page
app.use(paginate.middleware(10, 60));

// Helmet helps you secure your Express apps by setting various HTTP headers
// https://github.com/helmetjs/helmet
app.use(helmet());

// Enable CORS with various options
// https://github.com/expressjs/cors
// Set up a whitelist and check against it:
const whitelist = [];

if (Constants.envs.development) {
  whitelist.push('http://localhost:3000');
}


app.use(cors());
// Request logger
// https://github.com/expressjs/morgan
if (!Constants.envs.test && !Constants.envs.production) {
  app.use(morgan('dev'));
}

// Parse incoming request bodies
// https://github.com/expressjs/body-parser
app.use(express.json({
  limit: '50mb',
}));

app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
}));

// Lets you use HTTP verbs such as PUT or DELETE
// https://github.com/expressjs/method-override
app.use(methodOverride());

app.use(express.static(__dirname + '/public'));

// Mount API routes
app.use(Constants.apiPrefix, routes);

app.listen(Constants.port, () => {
  // eslint-disable-next-line no-console
  if(app.get('env') === 'development' || app.get('env') === 'develop') {
    console.log(`
      port: ${Constants.port}
      env: ${app.get('env')}
      db: ${Constants.mongo.uri}
    `);
  } else {
    console.log(`
      port: ${Constants.port}
      env: ${app.get('env')}
    `);
  }
});

export default app;
