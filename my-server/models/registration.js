
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registrationSchema = new Schema({
    stt: { type: Number },
    maDangKy: { type: String },
    maKh: { type: String },
    tenKh: { type: String },
    maLop: { type: String },
    tenLopHoc: { type: String },
    khoaHoc: { type: String },
    tenKhoa: { type: String },
    chiNhanh: { type: String },
    ngayDangKy: { type: Date },
    trangThai: { type: String },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    'Registration',
    registrationSchema,
    'registration'
);
