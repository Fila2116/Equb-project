import express from "express";

import * as EqubType from "../../../controllers/admin/equb/equb-type.controller";

const router = express.Router();

router
  .route("/")
  .get(
    EqubType.getEqubTypes
  )

  
router
  .route("/:id")
  .get(
    EqubType.getEqubType
  )


export default router;
