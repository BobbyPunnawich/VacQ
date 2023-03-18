const express = require("express");

const { protect, authorize } = require("../middleware/auth");

const {
  getHospitals,
  getHospital,
  createHospitals,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospitals");
const router = express.Router();

router
  .route("/")
  .get(getHospitals)
  .post(protect, authorize("admin"), createHospitals);
router
  .route("/:id")
  .get(getHospital)
  .put(protect, authorize("admin"), updateHospital)
  .delete(protect, authorize("admin"), deleteHospital);

module.exports = router;
