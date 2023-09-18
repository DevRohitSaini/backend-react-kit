import BaseController from './base.controller';
import Employee from '../models/employee';
import ActivityLog from '../models/employeeLogs';
import randomize from 'randomatic';
import multerFileFilter from '../config/multer';
import Constants from '../config/constants';
import multer from 'multer';
import pify from 'pify';
import fs from 'fs-extra';
const util = require('util');
require('util.promisify').shim();
const removeFile = util.promisify(fs.unlink);

// Multer diskstorage for Profile image
let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, Constants.uploads.users.pdf.dest);
	},
	filename: (req, file, cb) => {
		if (file.mimetype == "image/jpeg") {
			cb(null, file.fieldname + '-' + Date.now());
		} else if (file.mimetype == "image/png") {
			cb(null, file.fieldname + '-' + Date.now());
		} else {
			cb(null, file.fieldname + '-' + file.originalname.split('.')[0] + '-' + Date.now() + '.pdf');
		}
	},
});

// Multer configuration for Profile image
let upload = pify(multer({
	storage: storage,
	fileFilter: multerFileFilter,
	limits: Constants.uploads.users.profile.limits
}).single('profileImg'));

class EmployeeController extends BaseController {
	whitelist = [
		'name',
		'email',
		'mobile',
		'password',
		'street',
		'city',
		'postcode',
		'country',
		'addressCoordinates',
		'gender',
		'dob',
		'language',
		'biography',
		'profileImageURL',
		'profileImageDest',
		'status',
		'role',
		'joininigDate',
		'skills',
		'education',
		'salary',
		'shift'
	];

	_populate = async (req, res, next) => {
		if (req.params.id && req.params.id != 'newemployee') {
			const {
				id,
			} = req.params;

			try {
				const employee = await
					Employee.findById(id)
						.exec();

				if (!employee) {
					const err = new Error('Employee not found.');
					err.status = 404;
					return next(err);
				}
				req.employee = employee;
				next();
			} catch (err) {
				console.log(err);
				next(err);
			}
		} else {
			next();
		}
	}

	create = async (req, res, next) => {
		const filter = req.body;

		if (!filter.password) {
			filter.password = "123456"
		}

		const refToken = randomize('Aa0', 10); // referral token
		filter.referralToken = refToken;

		const existingUser = await Employee.findOne({ 'email': req.body.email });

		if (existingUser) {
			const err = new Error('Email already exist.');
			err.status = 401;
			return next(err);
		} else {
			const params = this.filterParams(filter, this.whitelist);
			let newEmployee = new Employee({
				...params,
				password: filter.password,
				provider: 'local'
			});

			try {
				const employee = await newEmployee.save()
				res.status(201).json({
					isSuccess: true,
					employee: employee
				});
			} catch (err) {
				console.log(err);
				if (err)
					err.status = 400;
				next(err);
			}
		}
	}

	search = async (req, res, next) => {
		let filter = {};
		let sort = {};

		if (req.query.sort && req.query.key) {
			sort = {
				[req.query.key]: [req.query.sort],
			};
		}

		if (req.query.filter) {
			filter['$or'] = [];
			filter['$or'].push({
				'name': {
					'$regex': req.query.filter,
					'$options': 'i',
				},
			});
			filter['$or'].push({
				'mobile': {
					'$regex': req.query.filter,
					'$options': 'i',
				},
			});
			filter['$or'].push({
				'email': {
					'$regex': req.query.filter,
					'$options': 'i',
				},
			});
			filter['$or'].push({
				'role': {
					'$regex': req.query.filter,
					'$options': 'i',
				},
			});
		}

		if (req.query.type) {
			filter.type = req.query.type;
		}

		try {

			const [results, itemCount] = await Promise.all([
				Employee.find(filter).sort(sort).limit(req.query.limit).skip(req.skip).exec(),
				Employee.countDocuments(filter),
			]);

			const pageCount = Math.ceil(itemCount / req.query.limit);

			res.json({
				isSuccess: true,
				object: 'list',
				page: {
					...req.query,
					totalPages: pageCount,
					totalElements: itemCount,
				},
				data: results,
			});
		} catch (err) {
			next(err);
			console.log(err)
		}
	}

	fetch = async (req, res) => {
		const employee = req.employee;

		if (!employee) {
			return res.sendStatus(404);
		}
		const isSuccess = true;
		res.status(200).json({
			isSuccess,
			employee: employee
		});
	}

	update = async (req, res, next) => {
		let employee = req.body;
		let updatedEmployee = Object.assign(req.employee, employee);
		try {
			const savedEmployee = await updatedEmployee.save();
			const isSuccess = true;
			res.status(200).json({
				isSuccess,
				savedEmployee
			});
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	delete = async (req, res, next) => {
		if (!req.employee) {
			return res.sendStatus(403);
		}
		try {
			await req.employee.remove();
			//res.sendStatus(204);
			res.status(200).json({
				isSuccess: true
			});
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	uploadFile = async (req, res, next) => {
		let employee = req.employee;
		let existingPdfDest;
		try {
			await upload(req, res);
			let pdfName = req.file.originalname;
			let pdfUrl = req.protocol + '://' + req.get('host') + '/pdf/users/' + req.file.filename;
			let pdfDest = Constants.uploads.users.pdf.dest + req.file.filename;
			if (employee) {
				existingPdfDest = employee.pdfDest;
				employee.pdfName = pdfName;
				employee.pdfUrl = pdfUrl;
				employee.pdfDest = pdfDest;

				// delete old PDF
				// if (existingPdfDest !== employee.schema.path('pdfDest').defaultValue) {
				// 	await removeFile(existingPdfDest);
				// }
				if (existingPdfDest) {
					await removeFile(existingPdfDest);
				}

				res.json(await employee.save());
			} else {
				res.json({
					'pdfName': pdfName,
					'pdfUrl': pdfUrl,
					'pdfDest': pdfDest
				});
			}


		} catch (err) {
			console.log('error==>', err);
		}
	}

	// Inside your Express route
	punchIn = async (req, res, next) => {
		// Get the user ID from the JWT token
		const employeeId = req.employee._id;
		const useAction = req.body.action;
		let hasPunchedIn = true;
		if(useAction =='Punch Out'){
			hasPunchedIn = false;
		}

		const employee= {
			hasPunchedIn : hasPunchedIn
		}
		
		let updatedEmployee = Object.assign(req.employee, employee);
		try {


			// Create a new activity log entry
			const newActivityLog = new ActivityLog({
				userId: employeeId,
				action: useAction,
				timestamp: new Date(),
			});

			// Save the activity log to the database
			await newActivityLog.save();

			const savedEmployee = await updatedEmployee.save();


			// Emit a socket.io event for real-time updates (if applicable)
			//io.emit('newActivityLog', newActivityLog);

			res.status(201).json({
				isSuccess: true,
				message: useAction + ' successful',
				employee : savedEmployee
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}

	fetchActivityLogs = async (req, res, next) => {
		let filter = {};
		const employeeId = req.employee._id;
		// Calculate the start and end of the current day
		const currentDate = new Date();

		// current date
		const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
		const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

		// current Week
		const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
		const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));


		// current Month
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		try {

			filter['$and'] = [];
			filter['$and'].push({
				'userId': {
					'$eq': employeeId,
				},
			});
			filter['$and'].push({
				'timestamp': {
					'$gte': new Date(startOfDay),
					'$lte': new Date(endOfDay)
				},
			});
			
			const activityLogs = await ActivityLog.find(filter).sort({ timestamp: 1 });
			const logsWithPunchInStatus = activityLogs.map((log) => ({
				...log.toObject(),
				hasPunchIn: !!log.punchIn, // Convert punchIn timestamp to boolean
			  }));
			
			res.status(201).json({
				isSuccess: true,
				activityLogs: logsWithPunchInStatus
			});

		} catch (err) {
			next(err);
			console.log(err)
		}
	}

	fetchActivityLogs2 = async (req, res, next) => {
		let filter = {};
		const employeeId = req.employee._id;
		const { startDate, endDate } = req.query;

		// Parse startDate and endDate into Date objects
		const parsedStartDate = new Date(startDate);
		const parsedEndDate = new Date(endDate);
	  
		let fromDate = new Date(parsedStartDate);
		let toDate = new Date(parsedEndDate);
	  
		fromDate.setDate(parsedStartDate.getDate());
		toDate.setDate(parsedEndDate.getDate());
		toDate.setHours(23, 59, 59, 999); // Set to the end of the day

		try {

			filter['$and'] = [];
			filter['$and'].push({
				'userId': {
					'$eq': employeeId,
				},
			});
			filter['$and'].push({
				'timestamp': {
					'$gte': fromDate,
					'$lte': toDate
				},
			});

			const activityLogs = await ActivityLog.find(filter).sort({ timestamp: 1 });
			
			res.status(201).json({
				isSuccess: true,
				activityLogs: activityLogs
			});

		} catch (err) {
			next(err);
			console.log(err)
		}
	}


}
export default new EmployeeController();
