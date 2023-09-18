import { Router } from 'express';
import AuthController from './../controllers/auth.controller';

const routes = new Router();

routes.route('/admin-login').post(AuthController.adminLogin);
routes.route('/employee-login').post(AuthController.employeeLogin);
routes.route('/check-credentials').post(AuthController.checkCredentials);
routes.route('/change-password').put(AuthController.changePassword);

routes.route('/admin-signup').post(AuthController.signup);

export default routes;
