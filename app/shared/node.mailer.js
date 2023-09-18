import nodemailer from 'nodemailer';
import Constants from '../config/constants';

const transporter = nodemailer.createTransport(Constants.mailer.options);

export const mailOptions = (from = '', to, subject, text, html, pdf, cc) => {
  let obj = {
    from,
    to,
    subject,
    text,
    html,
    cc,
  };
  if (pdf) {
    obj.attachments = pdf;
  }
  return obj;
};

export const sendEmail = async (options, cb) => {
  let from = Constants.mailer.fromName;
  if (options.from) from = options.from;
  if (process.env.NODE_ENV === 'development') options.to = process.env.email; 
  options.from = from + ' <' + Constants.mailer.from + '>';
  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log(error, info);
    }
    transporter.close();
  });
};
