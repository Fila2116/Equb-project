import express, { Request, Response } from "express";
import * as UserAuthMiddleware from "../middlewares/user-auth.middleware";

import { PushNotification } from "../shared/notification/services/notification.service";
import { WebSocketService } from "../shared/web-socket/services/web-socket.service";
import prisma from "../config/db.config";
import { EventNames } from "../shared/web-socket/enums/event-name.enum";
const router = express.Router();

router
  .route("/notification")
  .get(UserAuthMiddleware.verifyUser,async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({where:{id:req.user?.id},include:{deviceTokens:true}})
    if(!user){
      return res.json({
        msg:"user not found"
      })
    }
    const tokens = user.deviceTokens.map((token) => token.token);
 console.log(tokens);
 
    // // Firebase server key (replace this with your own server key from Firebase console)
    // const serverKey = 'YOUR_FIREBASE_SERVER_KEY';

    // const message = {
    //     to: deviceToken,
    //     notification: {
    //         title: title,
    //         body: body,
    //     },
    // };
    //@ts-ignore
    PushNotification.getInstance().sendSingleNotification(
      "Equb",
      "You have new equb",
    tokens[tokens.length-1]
    );
    res.json({
      msg: `Push notification done`,
    }); 
  })
  .post(async (req: Request, res: Response) => {
    console.log(req.body);
    res.json({
      body: req.body,
    });
  }); 

  router.route("/socket")
  .get(UserAuthMiddleware.verifyUser,async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({where:{id:req.user?.id},include:{deviceTokens:true}})
    if(!user){
      return res.json({
        msg:"user not found"
      })
    }
    WebSocketService.getInstance().publish(
      EventNames.SOCKET_CONNECTED,
      {data:"hi"},
      EventNames.SOCKET_CONNECTED
    );
    res.json({
      msg: `Web socket done`,
    });
  })
export default router;
