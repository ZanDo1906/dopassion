
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salesreportSchema = new Schema({
    ngay: { type: Date },
    chiNhanh: { type: String },
    khoaHoc: { type: String },
    lopHoc: { type: Date },
    doanhThu: { type: Number },
    hoanTien: { type: Number },
    tongThu: { type: Number },
},
    { 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Sales-report',
    salesreportSchema,
    'sales-report'
);
