import { resolve } from 'path';
import multer from 'multer';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp'),
    filename(request, file, callback) {
      callback(null, `${new Date().getTime()}-${file.originalname}`);
    },
  }),
};
