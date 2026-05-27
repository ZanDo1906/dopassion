export interface iClient {
    _id?: string;
    maKh: string;
    tenKhachHang: string;
    gioiTinh: string;
    ngaySinh: string;
    sdt: number;
    email: string;
    matKhau: string;
    ngayDangKy: string;
    trangThai: string;
    avatar: string | null;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
