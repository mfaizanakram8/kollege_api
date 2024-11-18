const TimeSchedule = require("./../models/TimeSchedule");
const asyncHandler = require("express-async-handler");

const getTimeSchedule = async (req, res) => {
  if (!req?.params?.department) {
    return res.status(400).json({ message: "Department Required" });
  }
  const timeSchedule = await TimeSchedule.findOne({
    department: req.params.department,
  }).exec();
  if (!timeSchedule) {
    return res.status(404).json({
      message: `Time Schedule not found`,
    });
  }
  res.json(timeSchedule);
};

const addTimeSchedule = asyncHandler(async (req, res) => {
  const { department, schedule } = req.body;

  if (!department || !schedule) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const TimeScheduleObj = { department, schedule };
  const record = await TimeSchedule.create(TimeScheduleObj);

  if (record) {
    res.status(201).json(record);
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

const updateTimeSchedule = asyncHandler(async (req, res) => {
  const { department, schedule } = req.body;

  if (!department || !schedule) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find schedule
  const timeSchedule = await TimeSchedule.findOne({ department }).exec();

  if (!timeSchedule) {
    // Create if doesn't exist
    const newSchedule = await TimeSchedule.create({ department, schedule });
    return res.json(newSchedule);
  }

  // Update existing schedule
  timeSchedule.schedule = schedule;
  const updatedSchedule = await timeSchedule.save();

  if (updatedSchedule) {
    res.json(updatedSchedule);
  } else {
    res.status(400).json({ message: "Failed to update schedule" });
  }
});

const deleteTimeSchedule = asyncHandler(async (req, res) => {
  if (!req?.params?.user_id) {
    return res.status(400).json({ message: "ID Required" });
  }

  const record = await TimeSchedule.findById(req.params.user_id).exec();
  if (!record) {
    return res.status(404).json({ message: "Time Schedule not found" });
  }
  await record.deleteOne();
  res.json({ message: `Time Schedule deleted` });
});

module.exports = {
  getTimeSchedule,
  addTimeSchedule,
  updateTimeSchedule,
  deleteTimeSchedule,
};