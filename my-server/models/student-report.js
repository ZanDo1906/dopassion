
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentreportSchema = new Schema({
    ngay: { type: Date },
    chiNhanh: { type: String },
    khoaHoc: { type: String },
    lopHoc: { type: String },
    soHocVienDangKy: { type: Number },
    soHocVienHuyDangKy: { type: Number },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Student-report',
    studentreportSchema,
    'student-report'
);
