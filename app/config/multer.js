/*File filter multer */
export default function imageFileFilter(req, file, callback) {
  if (file.mimetype !== 'application/pdf' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    var err = new Error();
    err.code = 'UNSUPPORTED_MEDIA_TYPEt';
    return callback(err, false);
  }
  callback(null, true);
};

