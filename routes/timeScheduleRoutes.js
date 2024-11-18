const express = require("express");
const router = express.Router();
const timeScheduleController = require("./../controllers/timeScheduleController");

router.route("/:department")
  .get(timeScheduleController.getTimeSchedule);

router.route("/")
  .post(timeScheduleController.addTimeSchedule)
  .patch(timeScheduleController.updateTimeSchedule);

router.route("/:user_id")
  .delete(timeScheduleController.deleteTimeSchedule);

module.exports = router;
