const Hospital = require("../models/Hospital");
const vacCenter = require("../models/VacCenter");

// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Public
exports.getHospitals = async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };

  // fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // loop over remove fields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // finding resource
  query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await Hospital.countDocuments();
    query = query.skip(startIndex).limit(limit);
    const hospitals = await query;
    console.log(req.query);

    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single hospital
// @route   GET /api/v1/hospitals/:id
// @access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new hospital
// @route   POST /api/v1/hospitals
// @access  Private
exports.createHospital = async (req, res, next) => {
  const hospital = await Hospital.create(req.body);
  res.status(201).json({ success: true, data: hospital });
};

// @desc    Update hospital
// @route   PUT /api/v1/hospitals/:id
// @access  Private
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/v1/hospitals/:id
// @access  Private
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({
        success: false,
      });
    }
    hospital.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get vaccine centers
// @route   GET /api/v1/hospitals/vacCenters
// @access  Public
exports.getVacCenters = (req, res, next) => {
  vacCenter.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving Vaccine Centers.",
      });
    } else res.send(data);
  });
};