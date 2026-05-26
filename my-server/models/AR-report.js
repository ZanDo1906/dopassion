
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ARreportSchema = new Schema({
    ngay: { type: Date },
    chiNhanh: { type: String },
    khoaHoc: { type: String },
    lopHoc: { type: String },
    soTienHocPhi: { type: Number },
    soTienGiamGia: { type: Number },
    soTienDaThu: { type: Number },
    soTienChuaThu: { type: Number },
    soTienHoan: { type: Number },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'AR-report',
    ARreportSchema,
    'AR-report'
);
