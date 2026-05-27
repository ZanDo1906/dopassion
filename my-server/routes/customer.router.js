const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Customer = require('../models/customer');

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
const uploadsDir = path.join(__dirname, '../uploads/avatar-client');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu trữ multer (lưu tạm file trước khi đổi tên theo tên khách hàng)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
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

// POST register
router.post('/register', async (req, res) => {
    try {
        const { email, sdt, tenKhachHang, matKhau, gioiTinh, ngaySinh } = req.body;

        if (!email || !sdt || !tenKhachHang || !matKhau) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin: email, sdt, tên khách hàng và mật khẩu.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const phoneNum = Number(sdt);

        // 1. Check if email or sdt already exists
        const existingEmail = await Customer.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(400).json({
                message: 'Email này đã được đăng ký tài khoản khác.'
            });
        }

        const existingSdt = await Customer.findOne({ sdt: phoneNum });
        if (existingSdt) {
            return res.status(400).json({
                message: 'Số điện thoại này đã được đăng ký tài khoản khác.'
            });
        }

        // 2. Generate maKh in format KH-DDMMYY-XXX
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const dateCode = `${day}${month}${year}`;

        const pattern = new RegExp(`^KH-${dateCode}-\\d{3}$`, 'i');
        const existingCustomers = await Customer.find({ maKh: pattern });
        let maxSeq = 0;
        existingCustomers.forEach(c => {
            if (c.maKh) {
                const match = c.maKh.match(/-(\d{3})$/);
                if (match) {
                    maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
                }
            }
        });
        const nextSeq = maxSeq + 1;
        const maKh = `KH-${dateCode}-${String(nextSeq).padStart(3, '0')}`;

        // 3. Create customer
        const newCustomer = new Customer({
            maKh,
            tenKhachHang,
            gioiTinh: gioiTinh || 'Khác',
            ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
            sdt: phoneNum,
            email: normalizedEmail,
            matKhau,
            ngayDangKy: new Date(),
            trangThai: 'Chưa đăng ký khóa',
            active: true
        });

        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { loginValue, password } = req.body;

        if (!loginValue || !password) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp email hoặc số điện thoại và mật khẩu.'
            });
        }

        const value = loginValue.trim();
        let query = {};

        // Check if value is email or phone number
        if (value.includes('@')) {
            query.email = value.toLowerCase();
        } else {
            const phoneNum = Number(value);
            if (isNaN(phoneNum)) {
                return res.status(400).json({
                    message: 'Số điện thoại không hợp lệ.'
                });
            }
            query.sdt = phoneNum;
        }

        const customer = await Customer.findOne(query);

        if (!customer) {
            return res.status(400).json({
                message: 'Tài khoản không tồn tại trên hệ thống.'
            });
        }

        if (customer.matKhau !== password) {
            return res.status(400).json({
                message: 'Mật khẩu không chính xác.'
            });
        }

        if (!customer.active) {
            return res.status(400).json({
                message: 'Tài khoản đã bị vô hiệu hóa.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            customer
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET all
router.get('/', async (req, res) => {
    try {
        const data = await Customer.find();
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
        const data = await Customer.findById(req.params.id);

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
        const newData = new Customer({
            ...req.body,
            active: true
        });
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
    console.log('BODY UPDATE:', req.body);
    console.log('ID:', req.params.id);
    try {
        const updatedData = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
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
        const deletedData = await Customer.findByIdAndDelete(req.params.id);

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

// POST verify account
router.post('/verify-account', async (req, res) => {
    try {
        const { loginValue } = req.body;

        if (!loginValue) {
            return res.status(400).json({
                message: 'Vui lòng nhập email hoặc số điện thoại.'
            });
        }

        const value = loginValue.trim();
        let query = {};

        if (value.includes('@')) {
            query.email = value.toLowerCase();
        } else {
            const phoneNum = Number(value);
            if (isNaN(phoneNum)) {
                return res.status(400).json({
                    message: 'Số điện thoại không hợp lệ.'
                });
            }
            query.sdt = phoneNum;
        }

        const customer = await Customer.findOne(query);

        if (!customer) {
            return res.status(404).json({
                message: 'Tài khoản không tồn tại trên hệ thống.'
            });
        }

        res.status(200).json({
            success: true,
            customerId: customer._id,
            email: customer.email,
            sdt: customer.sdt
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { customerId, newPassword } = req.body;

        if (!customerId || !newPassword) {
            return res.status(400).json({
                message: 'Thiếu thông tin yêu cầu: customerId và newPassword.'
            });
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { matKhau: newPassword },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mật khẩu đã được cập nhật thành công.'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST upload avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Vui lòng chọn một file ảnh.'
            });
        }

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            // Xóa file tạm vừa tải lên nếu không tìm thấy khách hàng
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản khách hàng.'
            });
        }

        // Tạo tên file mới theo định dạng: [ten-khach-hang]-[timestamp].[ext]
        const userSlug = removeVietnameseTones(customer.tenKhachHang || 'user');
        const fileExt = path.extname(req.file.originalname);
        const newFilename = `${userSlug}-${Date.now()}${fileExt}`;
        const newPath = path.join(uploadsDir, newFilename);

        // Đổi tên file tạm
        if (fs.existsSync(req.file.path)) {
            fs.renameSync(req.file.path, newPath);
        }

        const fileUrl = `/uploads/avatar-client/${newFilename}`;

        // Xóa ảnh cũ nếu có trong thư mục uploads/avatar-client
        if (customer.avatar && customer.avatar.startsWith('/uploads/avatar-client/')) {
            const oldFilename = path.basename(customer.avatar);
            const oldPath = path.join(uploadsDir, oldFilename);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error('Lỗi khi xóa ảnh đại diện cũ:', err);
                }
            }
        }

        // Cập nhật DB
        customer.avatar = fileUrl;
        const updatedCustomer = await customer.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công.',
            avatar: fileUrl,
            customer: updatedCustomer
        });
    } catch (error) {
        // Dọn dẹp tệp tin tạm nếu có lỗi xảy ra
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {}
        }
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
