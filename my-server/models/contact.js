
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    maLienHe: { type: String },
    maKh: { type: String },
    tenKhachHang: { type: String },
    noiDungLienHe: { type: String },
    trangThaiLienHe: { type: String },
    gmail: { type: String },
    soDienThoai: { type: String },
},
    {
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Contact',
    contactSchema,
    'contact'
);
