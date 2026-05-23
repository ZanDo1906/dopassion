
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    stt: { type: Number },
    maVaiTro: { type: String },
    tenVaiTro: { type: String },
    moTa: { type: String },
    active: { type: Boolean },
},
{ 
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model(
    'Role',
    roleSchema,
    'role'
);
