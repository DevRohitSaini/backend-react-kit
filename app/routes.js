import { Router } from 'express';
import MetaController from './controllers/meta.controller';
import AdminRoutes from './routes/admin.route';
import EmployeeRoutes from './routes/employee.route';
import errorHandler from './middleware/error-handler';
import AuthRoutes from './routes/auth.route';

const routes = new Router();

routes.get('/', MetaController.index);

// Auth
routes.use('/auth', AuthRoutes);

// Admin
routes.use('/admin', AdminRoutes);

// Employee
routes.use('/employee', EmployeeRoutes);


routes.use(errorHandler);

export default routes;
