export interface iCustomer {
    _id?: string;
    maKh: string;
    tenKhachHang: string;
    gioiTinh: string;
    ngaySinh: string;
    sdt: number;
    email: string;
    ngayDangKy: string;
    trangThai: string;
    active: boolean;
    avatar?: string | null;
    matKhau?: string;

    createdAt?: string;
    updatedAt?: string;
}