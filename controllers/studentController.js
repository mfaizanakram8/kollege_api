const Student = require("./../models/Student");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all Student
// @route GET /Student
// @access Private
const getStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const student = await Student.findById(req.params.id)
    .select("-password -_id -__v")
    .exec();
  if (!student) {
    return res.status(400).json({ message: "Student Not Found." });
  }
  res.json(student);
});

// @desc Get all Student
// @route GET /Student
// @access Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().select("-password").lean();
  if (!students?.length) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students);
});

// @desc Create New Student
// @route POST /Student
// @access Private
const createNewStudent = asyncHandler(async (req, res) => {
  const { name, course, email, username, password, department } = req.body;

  // Confirm Data
  if (!name || !email || !course || !username || !password || !department) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Student.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10);

  const studentObj = {
    name,
    course,
    email,
    username,
    password: hashedPwd,
    department,
    approved: false
  };

  // Create and Store New student
  const student = await Student.create(studentObj);

  if (student) {
    res.status(201).json({ message: `New Student ${name} registered. Waiting for HOD approval.` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Student
// @route PATCH /Student
// @access Private
const updateStudent = asyncHandler(async (req, res) => {
  console.log("Update student request:", req.body);
  const { id, approved } = req.body;

  const student = await Student.findById(id).exec();
  console.log("Found student:", student);

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  student.approved = approved;
  console.log("Updated student:", student);

  await student.save();
  console.log("Student saved");

  res.json({ message: "Student approved successfully" });
});

// @desc Delete Student
// @route DELETE /Student
// @access Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const student = await Student.findById(id).exec();
  const result = await student.deleteOne();
});

const getNewStudents = asyncHandler(async (req, res) => {
  console.log("Getting new students");
  console.log("Department:", req.params.department);

  try {
    const students = await Student.find({
      department: req.params.department,
      approved: false
    })
    .select("-password")
    .lean();

    console.log("Found students:", students);

    if (!students?.length) {
      console.log("No students found");
      return res.status(404).json({ message: "No pending student approvals" });
    }

    console.log("Returning students:", students);
    res.json(students);
  } catch (err) {
    console.error("Error in getNewStudents:", err);
    throw err;
  }
});

module.exports = {
  getStudent,
  getAllStudents,
  createNewStudent,
  updateStudent,
  deleteStudent,
  getNewStudents
};
