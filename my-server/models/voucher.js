
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voucherSchema = new Schema({
    stt: { type: Number },
    maVoucher: { type: String },
    tenChuongTrinh: { type: String },
    donViGiam: { type: String },
    thongSo: { type: Number },
    chiNhanh: [{ type: String }],
    khoaHocApDung: [{ type: String }],
    active: { type: Boolean },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    'Voucher',
    voucherSchema,
    'voucher'
);
