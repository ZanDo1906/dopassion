export interface iClient {
    _id?: string;
    stt: number;
    maKh: string;
    tenKhachHang: string;
    gioiTinh: string;
    ngaySinh: string;
    sdt: number;
    email: string;
    ngayDangKy: string;
    trangThai: string;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
