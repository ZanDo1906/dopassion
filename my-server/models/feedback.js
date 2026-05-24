
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    stt: { type: Number },
    maDanhGia: { type: String },
    maDangKy: { type: String },
    tenKhachHang: { type: String },
    tenLopHoc: { type: String },
    noiDungDanhGia: { type: String },
    soSao: { type: Number },
    ngayDanhGia: { type: Date },
    trangThai: { type: String },
    helpful: { type: Number, default: 0 },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Feedback',
    feedbackSchema,
    'feedback'
);
