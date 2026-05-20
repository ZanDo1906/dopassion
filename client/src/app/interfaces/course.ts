export interface iCourse {
    _id?: string;
    maKhoaHoc: string;
    tenKhoaHoc: string;
    hocPhi: number;
    moTa: string | null;
    active: boolean;

    createdAt?: string;
    updatedAt?: string;
}
