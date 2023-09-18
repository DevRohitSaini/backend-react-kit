import path from 'path';
import merge from 'lodash/merge';

// Default configuations applied to all environments
const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'develop',
      production: process.env.NODE_ENV === 'production',
    };
  },

  version: require('../../package.json').version,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 4000,
  ip: process.env.IP || '127.0.0.1',
  apiPrefix: '/api', // Could be /api/resource or /api/v2/resource
  userRoles: ['guest', 'user', 'admin'],
  ORDER_TAX : 7.7,

  /**
   * MongoDB configuration options
   */
  mongo: {
    seed: true,
    options: {
      db: {
        safe: true,
      },
    },
  },

  /**
   * Security configuation options regarding sessions, authentication and hashing
   */
  security: {
    sessionSecret: process.env.SESSION_SECRET || '96W0CxVVRcVV2jMsHVl8JQePYZtQzuRdTwSGed74uKk3PO-Dc2_FdMl_qh92RCgcb5-wz-stdkQGVKu6_z9G4IhETzBHWmMgieq7w9p0JAf8q-JMU2HQj9WxvBPg7FWUcHSF8AQUo0Hi9j0aC8ODRtOfTKD1VBZLsyx2jSoDN0vdd_kyMQvWlo1H5iSu4hjSFctYohX7-ns9Y6Geqd-aOF06W-n7988ju3K_rXu4mPU7AbSinEd-KFpEDxEK1fZ_X2cdx4UwDgrlhlS0CUUg76JB4ZsltIUuFK9ZDwTxrJfWyfPjmmmmyBmwh3_SGyfpVIsKZcwV9KVJcqhSc8VKFw',
    sessionExpiration: process.env.SESSION_EXPIRATION || 60 * 60 * 24 * 1, // 1 Day
    saltRounds: process.env.SALT_ROUNDS || 12,
  },

  /**
   * Upload configurations
   */
  uploads: {
    users: {      
      profile: {
        image: {
          dest: 'app/public/images/users/profile/',
          limits: {
            fileSize: 20 * 1024 * 1024, // Max file size in bytes (20 MB)
          },
        },
      }  
    }       
  },
};

// Environment specific overrides
const environmentConfigs = {
  development: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/react-starter-api',
    },
    security: {
      saltRounds: 4,
    },
    mailer: {
      fromName: process.env.MAILER_FROM || 'MyExpertise',
      from: process.env.MAILER_FROM || 'abhishekmodanwal3058@gmail.com',
      options: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAILER_EMAIL_ID || 'abhishekmodanwal3058@gmail.com',
          pass: process.env.MAILER_PASSWORD || 'flqntpduxbfufttx',
        },
      },
    },
  },
  local: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/react-starter-api',
    },
    security: {
      saltRounds: 4,
    },
    mailer: {
      fromName: process.env.MAILER_FROM || 'MyExpertise',
      from: process.env.MAILER_FROM || 'abhishekmodanwal3058@gmail.com',
      options: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAILER_EMAIL_ID || 'abhishekmodanwal3058@gmail.com',
          pass: process.env.MAILER_PASSWORD || 'flqntpduxbfufttx',
        },
      },
    },
  },
  test: {
    port: 5678,
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/test-react-starter-api',
    },
    security: {
      saltRounds: 4,
    },
  },
  production: {
    ip: '52.15.155.155',
    mongo: {
      seed: false,
      uri: process.env.MONGO_URI,
    },
    mailer: {
      fromName: process.env.MAILER_FROM || 'MyExpertise',
      from: process.env.MAILER_FROM || 'abhishekmodanwal3058@gmail.com',
      options: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAILER_EMAIL_ID || 'abhishekmodanwal3058@gmail.com',
          pass: process.env.MAILER_PASSWORD || 'flqntpduxbfufttx',
        },
      },
    },
  },
};

// Recursively merge configurations
export default merge(defaultConfig, environmentConfigs[process.env.NODE_ENV] || {});
