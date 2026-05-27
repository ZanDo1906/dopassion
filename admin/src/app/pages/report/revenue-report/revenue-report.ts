import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FilterConfig,
    FilterDataPicker
} from '../../../components/filter-data-picker/filter-data-picker';

import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    PieController
} from 'chart.js';

import { RevenueReportService } from '../../../services/sales-report';
import { iRevenueReport } from '../../../interfaces/sales-report';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
    selector: 'app-revenue-report',
    standalone: true,
    imports: [
        CommonModule,
        FilterDataPicker
    ],
    templateUrl: './revenue-report.html',
    styleUrls: ['./revenue-report.css']
})
export class RevenueReport implements OnInit {

    constructor(
        private revenueReportService: RevenueReportService
    ) {

        Chart.register(
            ArcElement,
            Tooltip,
            Legend,
            Title,
            PieController
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

    allData: iRevenueReport[] = [];

    filteredData: any[] = [];

    paginatedData: any[] = [];

    currentPage = 1;

    itemsPerPage = 10;

    pageSizeOptions = [10, 20, 50];

    ngOnInit(): void {

        this.revenueReportService
            .getRevenueReport()
            .subscribe({

                next: (data: any) => {

                    console.log('REVENUE DATA', data);

                    this.allData = data.map((item: any) => ({

                        ngay:
                            item.ngay,

                        chiNhanh:
                            item.chiNhanh,

                        khoaHoc:
                            String(item.khoaHoc || '')
                                .trim()
                                .toUpperCase(),

                        lopHoc:
                            item.lopHoc,

                        doanhThu:
                            Number(item.doanhThu || 0),

                        hoanTien:
                            Number(item.hoanTien || 0),

                        tongThu:
                            Number(item.tongThu || 0)

                    }));

                    console.log('ALL DATA', this.allData);

                    this.filteredData = [...this.allData];

                    this.updatePagination();

                    this.renderCharts();
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

                // item.ngay = dd/MM/yyyy
                const parts =
                    String(item.ngay).split('/');

                const itemDate =
                    new Date(
                        Number(parts[2]),
                        Number(parts[1]) - 1,
                        Number(parts[0])
                    );

                itemDate.setHours(0, 0, 0, 0);

                let fromDate = null;

                let toDate = null;

                if (filterValues.ngay.fromDate) {

                    fromDate =
                        new Date(filterValues.ngay.fromDate);

                    fromDate.setHours(0, 0, 0, 0);
                }

                if (filterValues.ngay.toDate) {

                    toDate =
                        new Date(filterValues.ngay.toDate);

                    toDate.setHours(23, 59, 59, 999);
                }

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

        this.renderCharts();
    }

    handleReset(): void {

        this.filteredData = [...this.allData];

        this.currentPage = 1;

        this.updatePagination();

        this.renderCharts();
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

    renderCharts(): void {

        this.renderPieChart(
            'CN1',
            'chartCN1'
        );

        this.renderPieChart(
            'CN2',
            'chartCN2'
        );

        this.renderPieChart(
            'CN3',
            'chartCN3'
        );
    }

    renderPieChart(
        chiNhanh: string,
        canvasId: string
    ): void {

        const canvas =
            document.getElementById(
                canvasId
            ) as HTMLCanvasElement;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        Chart.getChart(canvas)?.destroy();

        let swTongThu = 0;

        let lrTongThu = 0;

        this.filteredData.forEach((item: any) => {

            if (
                item.chiNhanh !== chiNhanh
            ) {
                return;
            }

            const khoaHoc =
                String(item.khoaHoc || '')
                    .trim()
                    .toUpperCase();

            // ======================
            // SW
            // ======================

            if (
                khoaHoc === 'SW' ||
                khoaHoc.includes('SPEAKING')
            ) {

                swTongThu +=
                    Number(item.tongThu || 0);
            }

            // ======================
            // LR
            // ======================

            else if (
                khoaHoc === 'LR' ||
                khoaHoc.includes('LISTENING')
            ) {

                lrTongThu +=
                    Number(item.tongThu || 0);
            }

        });

        console.log(
            chiNhanh,
            swTongThu,
            lrTongThu
        );

        new Chart(ctx, {

            type: 'pie',

            data: {

                labels: [
                    'SW',
                    'LR'
                ],

                datasets: [
                    {
                        data: [
                            swTongThu,
                            lrTongThu
                        ],

                        backgroundColor: [
                            '#4C70AD',
                            '#EC7E16'
                        ]
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: 'bottom'
                    },

                    title: {

                        display: true,

                        text:
                            `Doanh thu ${chiNhanh}`
                    }
                }
            }
        });
    }
    exportExcel(): void {

    const exportData = this.filteredData.map(
        (
            item: any,
            index: number
        ) => ({

            'STT':
                index + 1,

            'Ngày':
                item.ngay,

            'Chi nhánh':
                item.chiNhanh,

            'Khóa học':
                item.khoaHoc,

            'Lớp học':
                item.lopHoc,

            'Doanh thu':
                item.doanhThu,

            'Hoàn tiền':
                item.hoanTien,

            'Tổng thu':
                item.tongThu

        })
    );

    const worksheet =
        XLSX.utils.json_to_sheet(exportData);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'BaoCaoDoanhThu'
    );

    worksheet['!cols'] = [

        { wch: 8 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }

    ];

    const excelBuffer =
        XLSX.write(workbook, {

            bookType: 'xlsx',

            type: 'array'
        });

    const blob = new Blob(
        [excelBuffer],
        {
            type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        }
    );

    saveAs(
        blob,
        `BaoCaoDoanhThu_${new Date().getTime()}.xlsx`
    );
}
}