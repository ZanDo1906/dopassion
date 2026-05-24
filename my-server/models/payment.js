
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
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
    hocPhi: { type: Number },
    voucher: { type: String },
    thongSoGiam: { type: Number },
    soTienCanThanhToan: { type: Number },
    soTienConLai: { type: Number },
    trangThaiThanhToan: { type: String },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Payment',
    paymentSchema,
    'payment'
);
