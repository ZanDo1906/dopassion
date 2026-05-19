
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    stt: { type: Number },
    maKh: { type: String },
    tenKhachHang: { type: String },
    gioiTinh: { type: String },
    ngaySinh: { type: Date },
    sdt: { type: Number },
    email: { type: String },
    ngayDangKy: { type: Date },
    trangThai: { type: String },
    active: { type: Boolean },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    'Client',
    clientSchema,
    'client'
);
