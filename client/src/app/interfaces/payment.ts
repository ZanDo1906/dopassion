export interface iPayment {
    _id?: string;
    stt?: number;
    maDangKy: string;
    maKh: string;
    tenKh: string;
    maLop: string;
    tenLopHoc: string;
    khoaHoc: string;
    tenKhoa: string;
    chiNhanh: string;
    ngayDangKy: string;
    hocPhi: number;
    voucher: string;
    thongSoGiam: number;
    soTienCanThanhToan: number;
    soTienConLai: number;
    trangThaiThanhToan: string;

    createdAt?: string;
    updatedAt?: string;
}
