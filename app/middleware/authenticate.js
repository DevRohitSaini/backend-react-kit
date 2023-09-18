import jwt from 'jsonwebtoken';
import Constants from '../config/constants';
import AdminUser from '../models/adminUser'
import Employee from '../models/employee';

const {
  sessionSecret,
} = Constants.security;


export default function authenticate(req, res, next) {  
  let authorization;
  // get jwt token from header
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    authorization = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    authorization = req.query.token;
  }

  jwt.verify(authorization, sessionSecret, async (err, decoded) => {    
    if (err) {
      return res.sendStatus(401);
    }

    // If token is decoded successfully, find User and attach to our request
    // for use in our route or other middleware
    try {
      let user = null;

      if(decoded) {       
        user = await Employee.findById(decoded._id).exec();
      }

      if (!user) {
        user = await AdminUser.findById(decoded._id).exec();
      }

      if (!user) {
        return res.sendStatus(401);
      }

      req.currentUser = user;

      next();
    } catch (err) {
      next(err);
    }
  });
}
