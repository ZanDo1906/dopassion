export interface iStaff {
    "STT": number;
    "Mã NV": number | null;
    "Tên nhân viên": string;
    "Giới tính": string;
    "Ngày sinh": string;
    "SĐT": number;
    "Chi nhánh": string;
    "Vai trò": string;
    "Mã vai trò": string;
    "Ảnh CCCD": string | null;
    password?: string;
}
