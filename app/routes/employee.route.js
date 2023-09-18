import { Router } from 'express';
import EmployeeController from '../controllers/employee.controller';
import authenticate from './../middleware/authenticate';

const routes = new Router();

routes.route('/')
    .post(authenticate, EmployeeController.create)
    .get(authenticate, EmployeeController.search);

routes.route('/:id')
    .get(authenticate, EmployeeController._populate, EmployeeController.fetch)
    .put(authenticate, EmployeeController._populate, EmployeeController.update)
    .delete(authenticate, EmployeeController._populate, EmployeeController.delete);

routes.route('/uploadfile/:id')
    .post(EmployeeController._populate, EmployeeController.uploadFile);

routes.route('/punchIn/:id')
    .post(EmployeeController._populate, EmployeeController.punchIn)

routes.route('/activity-logs/current/:id')
    .get(EmployeeController._populate, EmployeeController.fetchActivityLogs);

routes.route('/activity-logs/:id')
    .get(EmployeeController._populate, EmployeeController.fetchActivityLogs2)

export default routes;
