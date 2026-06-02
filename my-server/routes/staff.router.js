const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Staff = require('../models/staff');

// Hàm loại bỏ dấu tiếng Việt và ký tự đặc biệt để đặt tên file an toàn
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

// Cấu hình thư mục chứa ảnh upload
const uploadsDir = path.join(__dirname, '../uploads/avatar-admin');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu trữ multer (lưu tạm file trước khi đổi tên)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'temp-' + file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await Staff.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET by id
router.get('/:id', async (req, res) => {
    try {
        const data = await Staff.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const newData = new Staff(req.body);
        const savedData = await newData.save();

        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updatedData = await Staff.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json(updatedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedData = await Staff.findByIdAndDelete(req.params.id);

        if (!deletedData) {
            return res.status(404).json({
                message: 'Data not found'
            });
        }

        res.status(200).json({
            message: 'Deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST upload CCCD 2 mặt
router.post('/upload-cccd', upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files.front || !req.files.back) {
            return res.status(400).json({
                message: 'Vui lòng tải lên cả 2 mặt CCCD (front và back).'
            });
        }

        const staffName = req.body.staffName || 'staff';
        const nameSlug = removeVietnameseTones(staffName);
        const timestamp = Date.now();

        const frontFile = req.files.front[0];
        const backFile = req.files.back[0];

        const frontExt = path.extname(frontFile.originalname);
        const backExt = path.extname(backFile.originalname);

        const frontFilename = `${nameSlug}-cccd-mattruoc-${timestamp}${frontExt}`;
        const backFilename = `${nameSlug}-cccd-matsau-${timestamp}${backExt}`;

        const frontNewPath = path.join(uploadsDir, frontFilename);
        const backNewPath = path.join(uploadsDir, backFilename);

        // Đổi tên file tạm
        if (fs.existsSync(frontFile.path)) {
            fs.renameSync(frontFile.path, frontNewPath);
        }
        if (fs.existsSync(backFile.path)) {
            fs.renameSync(backFile.path, backNewPath);
        }

        const frontUrl = `/uploads/avatar-admin/${frontFilename}`;
        const backUrl = `/uploads/avatar-admin/${backFilename}`;

        res.status(200).json({
            success: true,
            front: frontUrl,
            back: backUrl
        });
    } catch (error) {
        // Dọn dẹp tệp tin tạm nếu có lỗi xảy ra
        if (req.files) {
            if (req.files.front && req.files.front[0] && fs.existsSync(req.files.front[0].path)) {
                try { fs.unlinkSync(req.files.front[0].path); } catch (err) {}
            }
            if (req.files.back && req.files.back[0] && fs.existsSync(req.files.back[0].path)) {
                try { fs.unlinkSync(req.files.back[0].path); } catch (err) {}
            }
        }
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
