export interface iClass {
    _id?: string;

    stt: number;
    maLop: string;
    tenLop: string;
    maKhoa: string;
    tenKhoaHoc: string;
    chiNhanh: string;
    giangVien: string;
    maNhanVien: string;
    khungGio: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}