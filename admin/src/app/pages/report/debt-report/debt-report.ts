
import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterConfig,FilterDataPicker } from '../../../components/filter-data-picker/filter-data-picker';
import { DebtReportService } from '../../../services/ar-report';
import { iDebtReport } from '../../../interfaces/AR-report';

@Component({
    selector:'app-debt-report',
    standalone:true,
    imports:[
        CommonModule,
        FilterDataPicker
    ],
    templateUrl:'./debt-report.html',
    styleUrls:['./debt-report.css']
})
export class DebtReport implements OnInit{

    constructor(
        private debtReportService:DebtReportService
    ){}

    filterConfig:FilterConfig[]=[
        {
            key:'ngay',
            label:'Ngày',
            type:'date-range'
        },
        {
            key:'chiNhanh',
            label:'Chi nhánh',
            type:'multi-select',
            options:[
                {
                    label:'CN1',
                    value:'CN1'
                },
                {
                    label:'CN2',
                    value:'CN2'
                },
                {
                    label:'CN3',
                    value:'CN3'
                }
            ]
        },
        {
            key:'khoaHoc',
            label:'Khóa học',
            type:'multi-select',
            options:[
                {
                    label:'SW',
                    value:'SW'
                },
                {
                    label:'LR',
                    value:'LR'
                }
            ]
        }
    ];

    allData:iDebtReport[]=[];

    filteredData:any[]=[];

    paginatedData:any[]=[];

    currentPage=1;

    itemsPerPage=10;

    pageSizeOptions=[10,20,50];

    tongHocPhi=0;

    tongGiamGia=0;

    tongDaThu=0;

    tongChuaThu=0;

    tongHoan=0;

    ngOnInit():void{

        this.debtReportService
        .getDebtReport()
        .subscribe({

            next:(data:any)=>{

                this.allData=data.map((item:any)=>({

                    ngay:item['Ngày'],
                    chiNhanh:item['Chi nhánh'],
                    khoaHoc:item['Khóa học'],
                    lopHoc:item['Lớp học'],
                    soTienHocPhi:item['Số tiền học phí'],
                    soTienGiamGia:item['Số tiền giảm giá'],
                    soTienDaThu:item['Số tiền đã thu'],
                    soTienChuaThu:item['Số tiền chưa thu'],
                    soTienHoan:item['Số tiền hoàn']

                }));

                this.filteredData=[...this.allData];

                this.updatePagination();

                this.calculateSummary();
            },

            error:(err)=>{
                console.error(err);
            }
        });
    }

    handleSearch(filterValues:any):void{

        this.filteredData=this.allData.filter((item:any)=>{

            let matchDate=true;

            if(
                filterValues.ngay &&
                (
                    filterValues.ngay.fromDate ||
                    filterValues.ngay.toDate
                )
            ){

                const itemDate=
                    new Date(item.ngay);

                const fromDate=
                    filterValues.ngay.fromDate
                    ? new Date(filterValues.ngay.fromDate)
                    : null;

                const toDate=
                    filterValues.ngay.toDate
                    ? new Date(filterValues.ngay.toDate)
                    : null;

                if(
                    fromDate &&
                    itemDate<fromDate
                ){
                    matchDate=false;
                }

                if(
                    toDate &&
                    itemDate>toDate
                ){
                    matchDate=false;
                }
            }

            let matchChiNhanh=true;

            if(
                filterValues.chiNhanh &&
                filterValues.chiNhanh.length>0
            ){

                matchChiNhanh=
                    filterValues.chiNhanh.includes(
                        item.chiNhanh
                    );
            }

            let matchKhoaHoc=true;

            if(
                filterValues.khoaHoc &&
                filterValues.khoaHoc.length>0
            ){

                matchKhoaHoc=
                    filterValues.khoaHoc.includes(
                        item.khoaHoc
                    );
            }

            return(
                matchDate &&
                matchChiNhanh &&
                matchKhoaHoc
            );
        });

        this.currentPage=1;

        this.updatePagination();

        this.calculateSummary();
    }

    handleReset():void{

        this.filteredData=[...this.allData];

        this.currentPage=1;

        this.updatePagination();

        this.calculateSummary();
    }

    calculateSummary():void{

        this.tongHocPhi=0;

        this.tongGiamGia=0;

        this.tongDaThu=0;

        this.tongChuaThu=0;

        this.tongHoan=0;

        this.filteredData.forEach((item:any)=>{

            this.tongHocPhi+=Number(item.soTienHocPhi);

            this.tongGiamGia+=Number(item.soTienGiamGia);

            this.tongDaThu+=Number(item.soTienDaThu);

            this.tongChuaThu+=Number(item.soTienChuaThu);

            this.tongHoan+=Number(item.soTienHoan);
        });
    }

    get totalPages():number{

        return Math.max(
            1,
            Math.ceil(
                this.filteredData.length
                /this.itemsPerPage
            )
        );
    }

    get pages():number[]{

        return Array.from(
            {
                length:this.totalPages
            },
            (_,i)=>i+1
        );
    }

    changePage(page:number):void{

        if(
            page<1 ||
            page>this.totalPages
        ){
            return;
        }

        this.currentPage=page;

        this.updatePagination();
    }

    changePageSize(event:Event):void{

        const value=
            (event.target as HTMLSelectElement).value;

        this.itemsPerPage=Number(value);

        this.currentPage=1;

        this.updatePagination();
    }

    updatePagination():void{

        const start=
            (this.currentPage-1)
            *this.itemsPerPage;

        const end=
            start+this.itemsPerPage;

        this.paginatedData=
            this.filteredData.slice(start,end);
    }
}
