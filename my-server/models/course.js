
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    maKhoaHoc: { type: String },
    tenKhoaHoc: { type: String },
    hocPhi: { type: Number },
    moTa: { type: String },
    active: { type: Boolean },
},
{
    timestamps: true
});

module.exports = mongoose.model(
    'Course',
    courseSchema,
    'course'
);
