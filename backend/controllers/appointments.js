const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

//@desc     Get all appointments
//@routes   Get /api/v1/appointments
//@acess    Public
exports.getAppointments = async (req, res, next) => {
  let query;

  if (req.user.role !== "admin") {
    query = Appointment.find({ user: req.user.id }).populate({
      path: "hospital",
      select: "name province tel",
    });
  } else {
    query = Appointment.find().populate({
      path: "hospital",
      select: "name province tel",
    });
  }

  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc     Get a single appointment
//@routes   GET /api/v1/appointments/:id
//@acess    Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "hospital",
      select: "name province tel",
    });

    if (!appointment) {
      res.status(400).json({
        success: false,
        message: `Cannot find Appointment with this id of ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc     Create a new appointment
//@routes   POST /api/v1/appointments
//@acess    Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    req.body.hospital = req.params.hospitalId;

    // Check for published hospital
    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: `Cannot find Hospital with this id of ${req.params.hospitalId}`,
      });
    }

    const existedAppointment = await Appointment.find({ user: req.user.id });

    // Check if user has already booked 3 appointments
    if (existedAppointment.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `${req.user.id} have already booked 3 appointments`,
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Cannot create Appointment" });
  }
};

//@desc     Update appointment
//@routes   PUT /api/v1/appointments/:id
//@acess    Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: `Cannot find Appointment with this id of ${req.params.id}`,
      });
    }

    // Make sure user is appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};

//@desc     Delete appointment
//@routes   DELETE /api/v1/appointments/:id
//@acess    Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: `Cannot find Appointment with this id of ${req.params.id}`,
      });
    }

    // Make sure user is appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`,
      });
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};
