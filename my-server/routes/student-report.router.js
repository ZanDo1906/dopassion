// const express = require('express');
// const router = express.Router();

// const Registration =
//     require('../models/registration');

// const Class =
//     require('../models/class');

// // GET all
// router.get('/', async (req, res) => {
//     try {
//         const data = await StudentReport.find();
//         res.status(200).json(data);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// });

// // GET by id
// router.get('/:id', async (req, res) => {
//     try {
//         const data = await StudentReport.findById(req.params.id);

//         if (!data) {
//             return res.status(404).json({
//                 message: 'Data not found'
//             });
//         }

//         res.status(200).json(data);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// });

// // CREATE
// router.post('/', async (req, res) => {
//     try {
//         const newData = new StudentReport(req.body);
//         const savedData = await newData.save();

//         res.status(201).json(savedData);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// });

// // UPDATE
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedData = await StudentReport.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );

//         if (!updatedData) {
//             return res.status(404).json({
//                 message: 'Data not found'
//             });
//         }

//         res.status(200).json(updatedData);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// });

// // DELETE
// router.delete('/:id', async (req, res) => {
//     try {
//         const deletedData = await StudentReport.findByIdAndDelete(req.params.id);

//         if (!deletedData) {
//             return res.status(404).json({
//                 message: 'Data not found'
//             });
//         }

//         res.status(200).json({
//             message: 'Deleted successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

const Registration =
    require('../models/registration');

const Class =
    require('../models/class');

// GET REPORT
router.get('/', async (req, res) => {

    try {

        // LẤY TOÀN BỘ ĐĂNG KÝ
        const registrations =
            await Registration.find();

        // LẤY TOÀN BỘ LỚP HỌC
        const classes =
            await Class.find();

        // RAW DATA
        const rawData = registrations.map((item) => {

            // TÌM LỚP HỌC TƯƠNG ỨNG
            const classInfo =
                classes.find(
                    c => c.maLop === item.maLop
                );

            return {

                ngay:
                    item.ngayDangKy,

                chiNhanh:
                    classInfo?.chiNhanh
                    || item.chiNhanh
                    || '',

                khoaHoc:
                    classInfo?.tenKhoaHoc
                    || item.tenKhoa
                    || '',

                lopHoc:
                    classInfo?.tenLop
                    || item.tenLopHoc
                    || '',

                // ĐĂNG KÝ
                soHocVienDangKy:
                    item.trangThai !== 'Đã hủy'
                        ? 1
                        : 0,

                // HỦY
                soHocVienHuyDangKy:
                    item.trangThai === 'Đã hủy'
                        ? 1
                        : 0

            };

        });

        // GROUP DATA
        const grouped = {};

        rawData.forEach((item) => {

            const ngay =
                new Date(item.ngay)
                    .toLocaleDateString('vi-VN');

            const key =
                `${ngay}_${item.chiNhanh}_${item.khoaHoc}_${item.lopHoc}`;

            // CHƯA CÓ DATA
            if (!grouped[key]) {

                grouped[key] = {

                    ngay: ngay,

                    chiNhanh:
                        item.chiNhanh,

                    khoaHoc:
                        item.khoaHoc,

                    lopHoc:
                        item.lopHoc,

                    soHocVienDangKy: 0,

                    soHocVienHuyDangKy: 0

                };

            }

            // CỘNG DỒN
            grouped[key].soHocVienDangKy +=
                item.soHocVienDangKy;

            grouped[key].soHocVienHuyDangKy +=
                item.soHocVienHuyDangKy;

        });

        // TRẢ KẾT QUẢ
        res.status(200).json(
            Object.values(grouped)
        );

    }
    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

});

module.exports = router;