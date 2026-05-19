import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterConfig, FilterDataPicker } from '../../../components/filter-data-picker/filter-data-picker';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import { StudentReportService } from '../../../services/student-report';
import { iStudentReport } from '../../../interfaces/student-report';
@Component({
    selector: 'app-student-report',
    standalone: true,
    imports: [
        CommonModule,
        FilterDataPicker
    ],
    templateUrl: './student-report.html',
    styleUrls: ['./student-report.css']
})
export class StudentReport implements OnInit {
    constructor(private studentReportService: StudentReportService) {
        Chart.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Tooltip,
            Legend,
            BarController
        );
    }
    filterConfig: FilterConfig[] = [
        {
            key: 'ngay',
            label: 'Ngày',
            type: 'date-range'
        },
        {
            key: 'chiNhanh',
            label: 'Chi nhánh',
            type: 'multi-select',
            options: [
                {
                    label: 'CN1',
                    value: 'CN1'
                },
                {
                    label: 'CN2',
                    value: 'CN2'
                },
                {
                    label: 'CN3',
                    value: 'CN3'
                }
            ]
        },

        {
            key: 'khoaHoc',
            label: 'Khóa học',
            type: 'multi-select',
            options: [
                {
                    label: 'SW',
                    value: 'SW'
                },
                {
                    label: 'LR',
                    value: 'LR'
                }
            ]
        }

    ];

    allData: iStudentReport[] = [];

    filteredData: any[] = [];

    paginatedData: any[] = [];

    currentPage = 1;

    itemsPerPage = 10;

    pageSizeOptions = [10, 20, 50];

    ngOnInit(): void {

        this.studentReportService
            .getStudentReport()
            .subscribe({

                next: (data: any) => {
                    console.log('DATA REPORT', data);

                    console.log('DATA REPORT', data);

                    this.allData = data.map((item: any) => ({
                        ngay: item.ngay,
                        chiNhanh: item.chiNhanh,
                        khoaHoc: item.khoaHoc,
                        lopHoc: item.lopHoc,
                        soHocVienDangKy: item.soHocVienDangKy,
                        soHocVienHuy: item.soHocVienHuyDangKy

                    }));

                    this.filteredData = [...this.allData];

                    this.updatePagination();

                    this.renderChart();
                },

                error: (err) => {

                    console.error(err);
                }
            });
    }

    handleSearch(filterValues: any): void {

        this.filteredData = this.allData.filter((item: any) => {

            // ======================
            // FILTER NGÀY
            // ======================

            let matchDate = true;

            if (
                filterValues.ngay &&
                (
                    filterValues.ngay.fromDate ||
                    filterValues.ngay.toDate
                )
            ) {

                const itemDate =
                    new Date(item.ngay);

                const fromDate =
                    filterValues.ngay.fromDate
                        ? new Date(filterValues.ngay.fromDate)
                        : null;

                const toDate =
                    filterValues.ngay.toDate
                        ? new Date(filterValues.ngay.toDate)
                        : null;

                if (
                    fromDate &&
                    itemDate < fromDate
                ) {
                    matchDate = false;
                }

                if (
                    toDate &&
                    itemDate > toDate
                ) {
                    matchDate = false;
                }
            }

            // ======================
            // FILTER CHI NHÁNH
            // ======================

            let matchChiNhanh = true;

            if (
                filterValues.chiNhanh &&
                filterValues.chiNhanh.length > 0
            ) {

                matchChiNhanh =
                    filterValues.chiNhanh.includes(
                        item.chiNhanh
                    );
            }

            // ======================
            // FILTER KHÓA HỌC
            // ======================

            let matchKhoaHoc = true;

            if (
                filterValues.khoaHoc &&
                filterValues.khoaHoc.length > 0
            ) {

                matchKhoaHoc =
                    filterValues.khoaHoc.includes(
                        item.khoaHoc
                    );
            }

            return (
                matchDate &&
                matchChiNhanh &&
                matchKhoaHoc
            );
        });

        this.currentPage = 1;

        this.updatePagination();

        this.renderChart();
    }

    handleReset(): void {

        this.filteredData = [...this.allData];

        this.currentPage = 1;

        this.updatePagination();
    }

    get totalPages(): number {

        return Math.max(
            1,
            Math.ceil(
                this.filteredData.length
                / this.itemsPerPage
            )
        );
    }

    get pages(): number[] {

        return Array.from(
            {
                length: this.totalPages
            },
            (_, i) => i + 1
        );
    }

    changePage(page: number): void {

        if (
            page < 1 ||
            page > this.totalPages
        ) {
            return;
        }

        this.currentPage = page;

        this.updatePagination();
    }

    changePageSize(event: Event): void {

        const value =
            (event.target as HTMLSelectElement).value;

        this.itemsPerPage = Number(value);

        this.currentPage = 1;

        this.updatePagination();
    }

    updatePagination(): void {

        const start =
            (this.currentPage - 1)
            * this.itemsPerPage;

        const end =
            start + this.itemsPerPage;

        this.paginatedData =
            this.filteredData.slice(start, end);
    }


    renderChart(): void {

        const canvas =
            document.getElementById(
                'studentChart'
            ) as HTMLCanvasElement;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        Chart.getChart(canvas)?.destroy();

        // LABEL CHI NHÁNH
        const labels = [
            'CN1',
            'CN2',
            'CN3'
        ];

        // SW
        const swDangKy = [0, 0, 0];
        const swHuy = [0, 0, 0];

        // LR
        const lrDangKy = [0, 0, 0];
        const lrHuy = [0, 0, 0];

        this.filteredData.forEach((item: any) => {

            const index =
                labels.indexOf(item.chiNhanh);

            if (index === -1) {
                return;
            }

            // SW
            if (item.khoaHoc === 'SW') {

                swDangKy[index] +=
                    item.soHocVienDangKy;

                swHuy[index] +=
                    item.soHocVienHuy;
            }

            // LR
            if (item.khoaHoc === 'LR') {

                lrDangKy[index] +=
                    item.soHocVienDangKy;

                lrHuy[index] +=
                    item.soHocVienHuy;
            }
        });

        new Chart(ctx, {

            type: 'bar',

            data: {

                labels: labels,

                datasets: [

                    {
                        label: 'SW - Đăng ký',

                        data: swDangKy,

                        backgroundColor: '#4C70AD'
                    },

                    {
                        label: 'SW - Hủy',

                        data: swHuy,

                        backgroundColor: '#6f98e1'
                    },

                    {
                        label: 'LR - Đăng ký',

                        data: lrDangKy,

                        backgroundColor: '#EC7E16'
                    },

                    {
                        label: 'LR - Hủy',

                        data: lrHuy,

                        backgroundColor: '#e5a568'
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: 'top'
                    },

                    title: {

                        display: true,

                        text:
                            'Thống kê học viên đăng ký và hủy'
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true
                    }
                }
            }
        });
    }
}
