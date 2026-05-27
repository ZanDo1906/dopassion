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

    createdAt?: string;
    updatedAt?: string;
}