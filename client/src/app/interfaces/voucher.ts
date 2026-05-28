export interface iVoucher {
    _id?: string;
    maVoucher: string;
    tenChuongTrinh: string;
    donViGiam: string;
    thongSo: number;
    chiNhanh: string | string[];
    khoaHocApDung: string | string[];
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
