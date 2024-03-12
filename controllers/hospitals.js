 const Hospital = require('../models/Hospital')


//@desc     Get all hospitals
//@routes   Get /api/v1/hospitals
//@acess    Public
exports.getHospitals= async (req,res,next)=>{
    try{
        let query;
        const reqQuery = {...req.query};
        const removeFields = ['select','sort', 'page', 'limit'];

        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Hospital.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const hospitals = await query;

        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }


        res.status(200).json({
            success:true,
            count:hospitals.length,
            pagination,
            data:hospitals
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Get a single hospital
//@routes   GET /api/v1/hospitals/:id
//@acess    Public
exports.getHospital= async (req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);
        if ( !hospital )  {
            res.status(400).json({success:false});    
        }
        res.status(200).json({success:true, data:hospital});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Create new hospital
//@routes   POST /api/v1/hospitals
//@acess    Private
exports.createHospital= async (req,res,next)=>{
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
        success:true,
         data:hospital
        });
};

//@desc     Update hospital
//@routes   PUT /api/v1/hospitals/:id
//@acess    Private
exports.updateHospital= async (req,res,next)=>{
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators :true
        });
        if ( !hospital )  {
            res.status(400).json({success:false});    
        }
        res.status(200).json({success:true, data:hospital});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Delete hospital
//@routes   DELETE /api/v1/hospitals/:id
//@acess    Private
exports.deleteHospital= async (req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);
        if ( !hospital )  {
            res.status(400).json({success:false});    
        }
        hospital.remove();
        res.status(200).json({success:true, data:hospital});
    } catch (err) {
        res.status(400).json({success:false});
    }
};