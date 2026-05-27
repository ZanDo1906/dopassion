
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    maKh: { type: String },
    tenKhachHang: { type: String },
    gioiTinh: { type: String },
    ngaySinh: { type: Date },
    sdt: { type: Number },
    email: { type: String },
    matKhau: { type: String, default: '123456' },
    avatar: { type: String, default: null },
    ngayDangKy: { type: Date },
    trangThai: { type: String },
    active: { type: Boolean },
},
    {
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Customer',
    customerSchema,
    'customer'
);
