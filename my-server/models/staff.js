
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
    maNv: { type: String },
    tenNhanVien: { type: String },
    gioiTinh: { type: String },
    ngaySinh: { type: Date },
    sdt: { type: Number },
    email: { type: String },
    chiNhanh: { type: String },
    vaiTro: { type: String },
    maVaiTro: { type: String },
    anhCccd: { type: String },
    password: { type: String },
    active: { type: Boolean },
},
    {
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Staff',
    staffSchema,
    'staff'
);
