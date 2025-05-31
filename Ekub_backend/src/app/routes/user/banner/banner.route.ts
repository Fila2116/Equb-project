import express from "express";

import * as BannerController from "../../../controllers/admin/banner/banner.controller";


const router = express.Router();

router
  .route("/")
  .get(
    BannerController.getBanners
  );
router
  .route("/:id")
  .get(
    BannerController.getBanner
  );


export default router;
