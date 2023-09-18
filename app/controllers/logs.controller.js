import BaseController from './base.controller';
import Logs from '../models/logs';
class LogsController extends BaseController {

    whitelist = [
      'activityName',
      'level',
      'ip',
      'message',
      'user',
      'createdAt',
    ];

    // Middleware to populate Log based on url param
    _populate = async (req, res, next) => {
      const {
        id,
      } = req.params;

      try {
        const item = await Logs.findById(id);
        if (!item) {
          const err = new Error('Log not found.');
          err.status = 404;
          return next(err);
        }
        req.logs = item;
        next();
      } catch (err) {
        err.status = err.name === 'CastError' ? 404 : 500;
        next(err);
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
      try {
        const [results, itemCount] = await Promise.all([
          Logs.find(filter).sort(sort).limit(req.query.limit).skip(req.skip).populate(
              { path: 'user', select: 'fname name' }
          ).exec(),
          Logs.countDocuments(filter),
        ]);

        const pageCount = Math.ceil(itemCount / req.query.limit);

        res.json({
          object: 'logs',
          page: {
            totalPages: pageCount,
            totalElements: itemCount,
            size: req.query.limit,
            pageNumber: req.query.page,
            role: req.query.role,
            category: req.query.category,
            filter: req.query.filter,
            sort: -1,
            key: 'createdAt',
          },
          data: results,
        });
      } catch (err) {
        next(err);
      }
    }

    /**
     * req.logs is populated by middleware in routes.js
     */

    fetch = (req, res) => {
      res.json(req.logs);
    }

    getAll = (req, res, next) => {

    }

    write(obj) {
      let { eventName, level, ip, message, user } = obj;
      Logs.create({
        eventName, level, ip, message, user,
      });
      // no await, since its only purpose is to log events

    }

    extractIp(req) {
      return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    }
}

export default new LogsController();
