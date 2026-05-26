const express = require('express');

const router = express.Router();

const Payment =
    require('../models/payment');

const Refund =
    require('../models/refund');

// ======================
// GET REPORT
// ======================

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
            // REFUND THEO MÃ ĐĂNG KÝ
            // ======================

            const refundList =
                refunds.filter(

                    r => r.maDangKy === item.maDangKy
                );

            // ======================
            // TỔNG HOÀN
            // ======================

            const tongHoan =
                refundList.reduce(

                    (sum, r) =>

                        sum + Number(r.soTienHoan || 0),

                    0
                );

            // ======================
            // TIỀN
            // ======================

            const hocPhi =
                Number(item.hocPhi || 0);

            const giamGia =
                Number(item.thongSoGiam || 0);

            const soTienCanThanhToan =
                Number(item.soTienCanThanhToan || 0);

            const soTienConLai =
                Number(item.soTienConLai || 0);

            const soTienDaThu =
                soTienCanThanhToan - soTienConLai;

            // ======================
            // RETURN RAW
            // ======================

            return {

                ngay:
                    item.ngayDangKy,

                chiNhanh:
                    item.chiNhanh || '',

                khoaHoc:
                    item.khoaHoc || '',

                lopHoc:
                    item.tenLopHoc || '',

                soTienHocPhi:
                    hocPhi,

                soTienGiamGia:
                    giamGia,

                soTienDaThu:
                    soTienDaThu,

                soTienChuaThu:
                    soTienConLai,

                soTienHoan:
                    tongHoan

            };

        });

        // ======================
        // GROUP DATA
        // ======================

        const grouped = {};

        rawData.forEach((item) => {

            const ngay =
                new Date(item.ngay)
                    .toLocaleDateString('vi-VN');

            const key =
                `${ngay}_${item.chiNhanh}_${item.khoaHoc}_${item.lopHoc}`;

            // ======================
            // CHƯA CÓ
            // ======================

            if (!grouped[key]) {

                grouped[key] = {

                    ngay: ngay,

                    chiNhanh:
                        item.chiNhanh,

                    khoaHoc:
                        item.khoaHoc,

                    lopHoc:
                        item.lopHoc,

                    soTienHocPhi: 0,

                    soTienGiamGia: 0,

                    soTienDaThu: 0,

                    soTienChuaThu: 0,

                    soTienHoan: 0

                };

            }

            // ======================
            // CỘNG DỒN
            // ======================

            grouped[key].soTienHocPhi +=
                Number(item.soTienHocPhi || 0);

            grouped[key].soTienGiamGia +=
                Number(item.soTienGiamGia || 0);

            grouped[key].soTienDaThu +=
                Number(item.soTienDaThu || 0);

            grouped[key].soTienChuaThu +=
                Number(item.soTienChuaThu || 0);

            grouped[key].soTienHoan +=
                Number(item.soTienHoan || 0);

        });

        // ======================
        // FINAL DATA
        // ======================

        const finalData =
            Object.values(grouped);

        // ======================
        // DEBUG
        // ======================

        console.log('RAW DATA');
        console.log(rawData);

        console.log('GROUPED DATA');
        console.log(finalData);

        // ======================
        // RESPONSE
        // ======================

        res.status(200).json(finalData);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            message: error.message

        });

    }

});

module.exports = router;