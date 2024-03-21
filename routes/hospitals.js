const express = require("express");
const {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getVacCenters,
} = require("../controllers/hospitals");
const appointmentRouter = require("./appointments");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.use("/:hospitalId/appointments", appointmentRouter);

router.route("/vacCenters").get(getVacCenters);
router
  .route("/")
  .get(getHospitals)
  .post(protect, authorize("admin"), createHospital);
router
  .route("/:id")
  .get(getHospital)
  .put(protect, authorize("admin"), updateHospital)
  .delete(protect, authorize("admin"), deleteHospital);

module.exports = router;