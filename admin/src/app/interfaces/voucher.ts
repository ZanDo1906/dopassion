export interface iVoucher {
    _id?: string;
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
