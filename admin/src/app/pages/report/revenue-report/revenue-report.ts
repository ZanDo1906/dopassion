import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterConfig, FilterDataPicker } from '../../../components/filter-data-picker/filter-data-picker';
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

                    this.allData = data.map((item: any) => ({
                        ngay: item.ngay,
                        chiNhanh: item.chiNhanh,
                        khoaHoc: item.khoaHoc,
                        lopHoc: item.lopHoc,
                        doanhThu: item.doanhThu,
                        hoanTien: item.hoanTien,
                        tongThu: item.tongThu
                    }));

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

        this.renderPieChart('CN1', 'chartCN1');

        this.renderPieChart('CN2', 'chartCN2');

        this.renderPieChart('CN3', 'chartCN3');
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

            if (item.chiNhanh !== chiNhanh) {
                return;
            }

            if (item.khoaHoc === 'SW') {
                swTongThu += item.tongThu;
            }

            if (item.khoaHoc === 'LR') {
                lrTongThu += item.tongThu;
            }
        });

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
                        text: `Doanh thu ${chiNhanh}`
                    }
                }
            }
        });
    }
}