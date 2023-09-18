import { Router } from 'express';
import AdminController from '../controllers/admin.controller';
import authenticate from './../middleware/authenticate';

const routes = new Router();

routes.route('/')
    .post(AdminController.create)
    .get(authenticate, AdminController.search);

routes.route('/:id')
    .get(authenticate, AdminController._populate, AdminController.fetch)
    .put( AdminController._populate, AdminController.update)
    .delete(authenticate, AdminController._populate, AdminController.delete);

export default routes;
