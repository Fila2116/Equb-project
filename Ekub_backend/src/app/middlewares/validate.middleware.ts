import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req:Request, res:Response, next:NextFunction) => {
    console.log('req.body')
    console.log(req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};