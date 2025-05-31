import express from "express";

import * as EqubCategory from "../../../controllers/admin/equb/equb-category.controller";

const router = express.Router();

router
  .route("/")
  .get(
    EqubCategory.getEqubCategories
  )

router
  .route("/:id")
  .get(
    EqubCategory.getEqubCategory
  );


export default router;
