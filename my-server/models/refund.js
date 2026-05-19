
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundSchema = new Schema({
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
    daThanhToan: { type: Number },
    soTienHoan: { type: Number },
    lyDoYeuCauHoanTien: { type: String },
    lyDoChapNhanHoanTien: { type: String },
    lyDoTuChoi: { type: String },
    trangThai: { type: String },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    'Refund',
    refundSchema,
    'refund'
);
