const Staff = require("../models/Staff");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const Paper = require("../models/Paper");

// @desc Get Staff
// @route GET /staff
// @access Private
const getStaff = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const staff = await Staff.findById(req.params.id)
    .select("-password -_id -__v")
    .lean();
  if (!staff) {
    return res.status(404).json({ message: "No Staff Found." });
  }
  res.json(staff);
});

// @desc Get all Staffs
// @route GET /Staffs
// @access Private
const getNewStaffs = asyncHandler(async (req, res) => {
  console.log("Department:", req.params.department);
  
  const staffs = await Staff.find({
    department: req.params.department,
    role: { $eq: "" }
  })
  .select("-password")
  .lean();

  console.log("Found staffs:", staffs);

  if (!staffs?.length) {
    return res.status(404).json({ message: "No pending staff approvals" });
  }
  res.json(staffs);
});

// @desc Get Staff Names only
// @route GET /StaffsList
// @access Private
const getStaffList = asyncHandler(async (req, res) => {
  if (!req?.params?.department)
    return res.status(400).json({ message: "Params Missing" });

  const staffsList = await Staff.find({
    department: req.params.department,
    role:{
      $in:['teacher','HOD']
    }
  })
    .select("name")
    .lean();
  if (!staffsList?.length) {
    return res.status(400).json({ message: "No Staff(s) Found" });
  }
  console.log(staffsList);
  res.json(staffsList);
});

// @desc Create New Staff
// @route POST /Staff
// @access Private
const createNewStaff = asyncHandler(async (req, res) => {
  const { username, name, email, department, password, role } = req.body;

  // Confirm Data
  if (!username || !name || !email || !department || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Staff.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const staffObj = {
    username,
    name,
    email,
    department,
    password: hashedPwd,
    role,
  };

  // Create and Store New staff
  const staff = await Staff.create(staffObj);

  if (staff) {
    res.status(201).json({ message: `New Staff ${username} Registered` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Staff
// @route PATCH /Staff
// @access Private
const approveStaff = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Find Staff
  const staff = await Staff.findById(id).exec();
  if (!staff) {
    return res.status(400).json({ message: "User not found" });
  }

  staff.role = "teacher"; // Explicitly set role to "teacher"
  console.log("Setting staff role to:", staff.role);

  await staff.save();
  console.log("Staff saved with role:", staff.role);

  res.json({ message: "Staff Approved" });
});

// @desc Delete Staff
// @route DELETE /Staff
// @access Private
const deleteStaff = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Staff ID required" });
  }

  const staff = await Staff.findById(id).exec();

  if (!staff) {
    return res.status(400).json({ message: "Staff not found" });
  }

  const result = await staff.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

// @desc Get New Students
// @route GET /NewStudents
// @access Private
const getNewStudents = asyncHandler(async (req, res) => {
  if (!req?.params?.department)
    return res.status(400).json({ message: "Params Missing" });

  const students = await Student.find({
    department: req.params.department,
    approved: false
  })
    .select("-password")
    .lean();
  if (!students?.length) {
    return res.status(404).json({ message: "No Registered Student(s) Found." });
  }
  res.json(students);
});

// @desc Get Staff Papers
// @route GET /papers/:staffId
// @access Private
const getStaffPapers = asyncHandler(async (req, res) => {
  console.log("Getting papers for staff:", req.params.staffId);
  
  if (!req?.params?.staffId) {
    return res.status(400).json({ message: "Staff ID required" });
  }

  const papers = await Paper.find({ teacher: req.params.staffId })
    .populate('students', 'name')
    .lean();

  console.log("Found papers:", papers);

  if (!papers?.length) {
    return res.status(404).json({ message: "No papers found for this staff" });
  }

  res.json(papers);
});

module.exports = {
  getStaff,
  getNewStaffs,
  getStaffList,
  createNewStaff,
  approveStaff,
  deleteStaff,
  getNewStudents,
  getStaffPapers
};
