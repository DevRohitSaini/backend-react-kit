import BaseController from './base.controller';
import AdminUser from '../models/adminUser';
import randomize from 'randomatic';
import multerFileFilter from '../config/multer';
import Constants from '../config/constants';
import multer from 'multer';
import pify from 'pify';
import fs from 'fs-extra';
const util = require('util');
require('util.promisify').shim();
const removeFile = util.promisify(fs.unlink);

// // Multer diskstorage for Profile image
// let storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, Constants.uploads.users.pdf.dest);
// 	},
// 	filename: (req, file, cb) => {
// 		if(file.mimetype=="image/jpeg"){
// 			cb(null, file.fieldname + '-' + Date.now());
// 		}else if(file.mimetype=="image/png"){
// 			cb(null, file.fieldname + '-' + Date.now());
// 		}else{
// 			cb(null, file.fieldname + '-' + file.originalname.split('.')[0] + '-' + Date.now() + '.pdf');
// 		}	
// 	},
// });

// // Multer configuration for Profile image
// let upload = pify(multer({
// 	storage: storage,
// 	fileFilter: multerFileFilter,
// 	limits: Constants.uploads.users.pdf.limits
// }).single('pdfFile'));

class AdminController extends BaseController {
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
		'role'
	];

	_populate = async (req, res, next) => {
		if (req.params.id && req.params.id != 'newAdmin') {
			const {
				id,
			} = req.params;

			try {
				const admin = await
				AdminUser.findById(id)
						.exec();

				if (!admin) {
					const err = new Error('Admin not found.');
					err.status = 404;
					return next(err);
				}
				req.admin = admin;
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

		const existingAdmin = await AdminUser.findOne({ 'email': req.body.email });

		if (existingAdmin) {
			const err = new Error('Email already exist.');
			err.status = 401;
			return next(err);
		} else {
			const params = this.filterParams(filter, this.whitelist);
			let newAdmin= new AdminUser({
				...params,
				password: filter.password,
				provider: 'local'
			});

			try {
				const admin = await newAdmin.save()
				res.status(201).json({
					isSuccess: true,
					admin: admin
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
				AdminUser.find(filter).sort(sort).limit(req.query.limit).skip(req.skip).exec(),
				AdminUser.countDocuments(filter),
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
		const admin = req.admin;

		if (!admin) {
			return res.sendStatus(404);
		}
		const isSuccess = true;
		res.status(200).json({
			isSuccess,
			admin: admin
		});
	}

	update = async (req, res, next) => {
		let admin = req.body;
		let updatedAdmin = Object.assign(req.admin, admin);
		try {
			const savedAdmin = await updatedAdmin.save();
			const isSuccess = true;
			res.status(200).json({
				isSuccess,
				savedAdmin
			});
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	delete = async (req, res, next) => {
		if (!req.admin) {
			return res.sendStatus(403);
		}
		try {
			await req.admin.remove();
			//res.sendStatus(204);
			res.status(200).json({
				isSuccess:true
			});
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

}
export default new AdminController();
