import express, { Request, Response } from "express";
import { getDateInNairobiTimezone } from "../shared/helpers/date.helper";
const router = express.Router();

  router.route("/")
  .get(async (req: Request, res: Response) => {
   
    res.json({
      date: getDateInNairobiTimezone(new Date()),
    });
  })
export default router;
