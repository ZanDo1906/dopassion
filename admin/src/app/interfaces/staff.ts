export interface iStaff {
    "STT": number;
    "Mã NV": string | number | null;
    "Tên nhân viên": string;
    "Giới tính": string;
    "Ngày sinh": string;
    "SĐT": number;
    "Địa chỉ"?: string;
    "Chi nhánh": string;
    "Vai trò": string;
    "Mã vai trò": string;
    "Ảnh CCCD": string | null;
    password?: string;
    [key: string]: any;
}
