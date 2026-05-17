import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FilterConfig,
    FilterDataPicker
}
from '../../../components/filter-data-picker/filter-data-picker';

import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    BarController
}
from 'chart.js';

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

export class StudentReport implements OnInit, AfterViewInit {

    constructor() {

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
            type: 'text'
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

    allData: any[] = [];

    filteredData: any[] = [];

    paginatedData: any[] = [];

    currentPage = 1;

    itemsPerPage = 10;

    pageSizeOptions = [10, 20, 50];

    ngOnInit(): void {

        // CHƯA CÓ DATA
        this.allData = [];

        this.filteredData = [];

        this.updatePagination();

    }
    ngAfterViewInit(): void {
      console.log('Chart loaded');

    this.renderChart();
    }

    handleSearch(filterValues: any): void {

        console.log(filterValues);
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
          console.log('KHÔNG TÌM THẤY CANVAS');
          return;
        }

console.log('ĐÃ TÌM THẤY CANVAS', canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('KHÔNG LẤY ĐƯỢC CTX');
            return;
        }

        new Chart(ctx, {

            type: 'bar',

            data: {

                labels: [

                    'CN1 - SW',
                    'CN1 - LR',

                    'CN2 - SW',
                    'CN2 - LR',

                    'CN3 - SW',
                    'CN3 - LR'
                ],

                datasets: [

                    {
                        label: 'Đăng ký',

                        data: [
                            120,
                            90,

                            150,
                            110,

                            130,
                            95
                        ],

                        backgroundColor: '#2a4d90',

                        borderRadius: 6
                    },

                    {
                        label: 'Hủy đăng ký',

                        data: [
                            12,
                            8,

                            15,
                            9,

                            10,
                            7
                        ],

                        backgroundColor: '#d9534f',

                        borderRadius: 6
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

                        text: 'Thống kê học viên đăng ký và hủy'
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            stepSize: 20
                        }
                    }
                }
            }
        });
    }
}