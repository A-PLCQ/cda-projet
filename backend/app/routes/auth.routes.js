import { Router } from 'express';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';
import { register, login } from '../controllers/auth.controller.js';

const r = Router();
r.post('/register', validate(registerSchema), register);
r.post('/login', validate(loginSchema), login);
export default r;
