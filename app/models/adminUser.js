import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Constants from '../config/constants';

const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

const AdminUserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    unique: true,
    validate: {
      validator(mainEmail) {
        // eslint-disable-next-line max-len
        const emailRegex = /^[-a-z0-9%S_+]+(\.[-a-z0-9%S_+]+)*@(?:[a-z0-9-]{1,63}\.){1,125}[a-z]{2,63}$/i;

        if (mainEmail) {
          return emailRegex.test(mainEmail);
        } else {
          return true;
        }
      },
      message: '{VALUE} is not a valid email.',
    },
  },
  mobile: String,
  password: String,
  street: String,
  city: String,
  postcode: String,
  country: String,
  addressCoordinates: {
    latitude: Number,
    longitude: Number
  },
  gender: String,
  dob: Date,
  language: [],
  biography: String,
  profileImageURL: {
    type: String,
    default: ''
  },
  profileImageDest: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'active'
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'admin'
  },
  history: {
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    emailSentDate: Date,
    isEmailOpen: {
      type: Boolean,
      default: false,
    },
    emailOpenDate: Date,
  }  

}, {
  timestamps: true,
});

// Strip out password field when sending user object to client
AdminUserSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    delete obj.__v;
    delete obj.password;
    delete obj.profileImageDest;
    return obj;
  },
});

//Ensure email has not been taken

//Validate password field
AdminUserSchema
  .path('password')
  .validate(function (password) {
    return password.length >= 6 && password.match(/\d+/g);
  }, 'Password be at least 6 characters long and contain 1 number.');

AdminUserSchema
  .pre('save', function (done) {
    // Encrypt password before saving the document
    if (this.isModified('password')) {
      const {
        saltRounds,
      } = Constants.security;
      this._hashPassword(this.password, saltRounds, (err, hash) => {
        this.password = hash;
        done();
      });
    } else {
      done();
    }
    // eslint-enable no-invalid-this
  });

/**
 * User Methods
 */
AdminUserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   * @public
   * @param {String} password
   * @return {Boolean} passwords match
   */
  authenticate(password) {
    return bcrypt.compareSync(password, this.password);
  },

  /**
   * Generates a JSON Web token used for route authentication
   * @public
   * @return {String} signed JSON web token
   */
  generateToken() {
    return jwt.sign({
      _id: this._id,
      email: this.email,
    }, Constants.security.sessionSecret, {
      expiresIn: Constants.security.sessionExpiration,
    });
  },

  /**
   * Create password hash
   * @private
   * @param {String} password
   * @param {Number} saltRounds
   * @param {Function} callback
   * @return {Boolean} passwords match
   */
  _hashPassword(password, saltRounds = Constants.security.saltRounds, callback) {
    return bcrypt.hash(password, saltRounds, callback);
  },
};

AdminUserSchema.plugin(autoIncrement.plugin, {
  model: 'AdminUser',
  field: 'adminUserID',
  startAt: 100000,
  incrementBy: 1
});

const AdminUserModel = mongoose.model('Admin', AdminUserSchema);
export default AdminUserModel;
