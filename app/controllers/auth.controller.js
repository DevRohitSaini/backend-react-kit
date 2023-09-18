import BaseController from './base.controller';
import randomize from 'randomatic';
import LogsController from './logs.controller';
import AdminUser from '../models/adminUser';
import Employee from '../models/employee';

class AuthController extends BaseController {
  whitelist = [
		'name',
		'email',
		'mobile',
		'password'		
	];

  adminLogin = async (req, res, next) => {
    const {
      email,
      password,
    } = req.body;


    try {
      const admin = await AdminUser.findOne({
        email: email,
      }).exec();

      if (!admin || !admin.authenticate(password)) {
        LogsController.write({
          eventName: 'LOGIN',
          ip: LogsController.extractIp(req),
          message: `failed login attempt for admin : ${email}`,
          level: 3,
        });

        const err = new Error('Please verify your credentials.');
        err.status = 401;
        return next(err);
      }

      if (admin.isBlocked) {
        const err = new Error('The IDS has detected an abnormality with your access and has blocked it as a precaution. Please contact the Helpdesk.');
        err.status = 403;
        return next(err);
      }

      const accessToken = admin.generateToken();
      LogsController.write({
        eventName: 'LOGIN',
        ip: LogsController.extractIp(req),
        message: `Successful login attempt for admin : ${email}`,
        level: 3,
        user: admin._id,
      });
      console.log('Admin Login Successful')
      const isSuccess = true;
      return res.status(200).json({
        isSuccess,
        accessToken,
        admin,
      });

    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  employeeLogin = async (req, res, next) => {
    const {
      email,
      password,
    } = req.body;


    try {
      const employee = await Employee.findOne({
        email: email,
      }).exec();

      if (!employee || !employee.authenticate(password)) {
        LogsController.write({
          eventName: 'LOGIN',
          ip: LogsController.extractIp(req),
          message: `failed login attempt for employee : ${email}`,
          level: 3,
        });

        const err = new Error('Please verify your credentials.');
        err.status = 401;
        return next(err);
      }

      if (employee.isBlocked) {
        const err = new Error('The IDS has detected an abnormality with your access and has blocked it as a precaution. Please contact the Helpdesk.');
        err.status = 403;
        return next(err);
      }

      const accessToken = employee.generateToken();
      LogsController.write({
        eventName: 'LOGIN',
        ip: LogsController.extractIp(req),
        message: `Successful login attempt for employee : ${email}`,
        level: 3,
        employee: employee._id,
      });
      console.log('Employee Log in Successful')
      const isSuccess = true;
      return res.status(200).json({
        isSuccess,
        accessToken,
        employee,
      });

    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  checkCredentials = async (req, res, next) => {
    const {
      email
    } = req.body;

    try {
      const employee = await Employee.findOne({
        email: email,
      }).exec();

      if (!employee) {
        const err = new Error('Please verify your credentials.');
        err.status = 401;
        return next(err);
      }

      if (employee.isBlocked) {
        const err = new Error('The IDS has detected an abnormality with your access and has blocked it as a precaution. Please contact the Helpdesk.');
        err.status = 403;
        return next(err);
      }

      return res.status(200).json({
        isSuccess: true
      });

    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  changePassword = async (req, res, next) => {
    const {
      email,
      password,
    } = req.body;

    try {
      const employee = await Employee.findOne({
        email: email,
      }).exec();

      if (!employee) {
        const err = new Error('Please verify your credentials.');
        err.status = 401;
        return next(err);
      }


      let jsonData = {
        "password": password
      }
      let employeeObj = Object.assign(employee, jsonData);
      const updatedEmployee = await employeeObj.save();

      return res.status(200).json({
        isSuccess: true
      });

    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  signup = async (req, res, next) => {    
		const filter = req.body;	

		if (!filter.password) {
			filter.password = "123456"
		}
		const refToken = randomize('Aa0', 10); // referral token
		filter.referralToken = refToken;

    const existingUser = await AdminUser.findOne({'email' : req.body.email});
    
    if(existingUser){
      const err = new Error('email already exist.');
      err.status = 401;
      return next(err);
    }else{
      const params = this.filterParams(filter, this.whitelist);
      let newUser = new AdminUser({
        ...params,
        password: filter.password,
        provider: 'local'
      });
      const user = await newUser.save();
      const isSuccess = true;
      const accessToken = user.generateToken();
      try {        
        return res.status(200).json({
          isSuccess,
          accessToken,
          user,
        });
      } catch (err) {
        if (err)
          err.status = 400;
        next(err);
      }      
    }	
	}
}

export default new AuthController();
