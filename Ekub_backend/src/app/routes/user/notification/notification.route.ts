import express from "express";

import * as Notification from "../../../controllers/user/notification/notification.controller";

const router = express.Router();

export default router;

router.route("/getNotification/:id").get(Notification.getNotification);

router
  .route("/delete-notifications/:id")
  .delete(Notification.deleteNotifications);
