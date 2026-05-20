export interface iStaff {
    _id?: string;
    stt: number;
    maNv: string;
    tenNhanVien: string;
    gioiTinh: string;
    ngaySinh: string;
    sdt: number;
    email: string;
    chiNhanh: string;
    vaiTro: string;
    maVaiTro: string;
    anhCccd: string | null;
    password?: string;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
