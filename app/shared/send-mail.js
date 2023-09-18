import { error } from 'console';
import { sendEmail, mailOptions } from './node.mailer';
const fs = require('fs');
const util = require('util');
require('util.promisify').shim();
const readFile = util.promisify(fs.readFile);
import moment from 'moment';
moment.locale('de');
const path = require('path');

export const sendEmployeeCredentials = async (admin, password, cb) => {
  let result;
  let subject = 'Access to the React System';
  try {
    result = await readFile(__dirname + '/admin-credentials.html', 'utf8');
    result = result.replace('{{admin.name}}', admin.name);
    result = result.replace('{{admin.adminUserID}}', admin.adminUserID);
    result = result.replace('{{admin.password}}', password);
    result = result.replace('{{currentDate}}', moment().format('YYYY'));
    const options = mailOptions(null, admin.email, subject, '', result);
    sendEmail(options, cb);
  } catch (e) {
    console.log(e);
  }
};

