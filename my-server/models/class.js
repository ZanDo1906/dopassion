const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    stt: { type: Number },
    maLop: { type: String },
    tenLop: { type: String },
    maKhoa: { type: String },
    tenKhoaHoc: { type: String },
    chiNhanh: { type: String },
    giangVien: { type: String },
    maNhanVien: { type: String },
    khungGio: { type: String },
    ngayBatDau: { type: String },
    ngayKetThuc: { type: String },
    active: { type: Boolean },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Class',
    classSchema,
    'class'
);
