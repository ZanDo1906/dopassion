export interface iClass {
    "STT": number;
    "Mã lớp": string;
    "Tên lớp": string;
    "Mã khóa": string;
    "Tên khóa học": string;
    "Chi nhánh": string;
    "Giảng viên": string;
    "Mã Nhân viên": string;
    "Khung giờ": string;
    "Ngày bắt đầu": string;
    "Ngày kết thúc": string;
}

export interface ClassFilter {
    courseCode?: string;      // Mã khóa (LR, SW)
    branch?: string;          // Chi nhánh (CN1, CN2, CN3)
    startDate?: string;       // Ngày bắt đầu từ
    endDate?: string;         // Ngày bắt đầu đến
    keyword?: string;         // Tìm kiếm theo tên lớp hoặc giảng viên
}