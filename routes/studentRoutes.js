const express = require("express");
const router = express.Router();
const studentController = require("./../controllers/studentController");

router.route("/approve/:department").get(studentController.getNewStudents);

router
  .route("/:id")
  .get(studentController.getStudent)
  .patch(studentController.updateStudent)
  .delete(studentController.deleteStudent);

router
  .route("/")
  .get(studentController.getAllStudents)
  .post(studentController.createNewStudent);

module.exports = router;
