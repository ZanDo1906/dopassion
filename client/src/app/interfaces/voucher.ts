export interface iVoucher {
    _id?: string;
    stt: number;
    maVoucher: string;
    tenChuongTrinh: string;
    donViGiam: string;
    thongSo: number;
    chiNhanh: string;
    khoaHocApDung: string;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
