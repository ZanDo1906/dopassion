const express = require('express');
const router = express.Router();

const Payment = require('../models/payment');

const Refund = require('../models/refund');

router.get('/', async (req, res) => {

    try {

        // ======================
        // LẤY DATA
        // ======================

        const payments =
            await Payment.find();

        const refunds =
            await Refund.find();

        // ======================
        // RAW DATA
        // ======================

        const rawData = payments.map((item) => {

            // ======================
            // REFUND
            // ======================

            const refundList =
                refunds.filter(

                    r => r.maDangKy === item.maDangKy
                );

            const tongHoan =
                refundList.reduce(

                    (sum, r) =>

                        sum + Number(r.soTienHoan || 0),

                    0
                );

            // ======================
            // DOANH THU
            // ======================

            const doanhThu =
                Number(item.soTienCanThanhToan || 0)
                - Number(item.soTienConLai || 0);

            // ======================
            // TỔNG THU
            // ======================

            const tongThu =
                doanhThu - tongHoan;

            return {

                ngay:
                    item.ngayDangKy,

                chiNhanh:
                    item.chiNhanh || '',

                khoaHoc:
                    item.khoaHoc || '',

                lopHoc:
                    item.tenLopHoc || '',

                doanhThu:
                    doanhThu,

                hoanTien:
                    tongHoan,

                tongThu:
                    tongThu
            };

        });

        // ======================
        // GROUP
        // ======================

        const grouped = {};

        rawData.forEach((item) => {

            const ngay =
                new Date(item.ngay)
                    .toLocaleDateString('vi-VN');

            const key =
                `${ngay}_${item.chiNhanh}_${item.khoaHoc}_${item.lopHoc}`;

            if (!grouped[key]) {

                grouped[key] = {

                    ngay: ngay,

                    chiNhanh:
                        item.chiNhanh,

                    khoaHoc:
                        item.khoaHoc,

                    lopHoc:
                        item.lopHoc,

                    doanhThu: 0,

                    hoanTien: 0,

                    tongThu: 0
                };
            }

            grouped[key].doanhThu +=
                Number(item.doanhThu || 0);

            grouped[key].hoanTien +=
                Number(item.hoanTien || 0);

            grouped[key].tongThu +=
                Number(item.tongThu || 0);

        });

        // ======================
        // FINAL
        // ======================

        const finalData =
            Object.values(grouped);

        res.status(200).json(finalData);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message
        });
    }

});

// // GET by id
// router.get('/:id', async (req, res) => {
//     try {
//         const data = await SalesReport.findById(req.params.id);

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
//         const newData = new SalesReport(req.body);
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
//         const updatedData = await SalesReport.findByIdAndUpdate(
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
//         const deletedData = await SalesReport.findByIdAndDelete(req.params.id);

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

module.exports = router;
