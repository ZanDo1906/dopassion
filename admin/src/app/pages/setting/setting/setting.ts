import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
selector:'app-setting',
standalone:true,
imports:[
CommonModule,
NgFor,
FormsModule
],
templateUrl:'./setting.html',
styleUrls:['./setting.css']
})

export class Setting {

configData = [
{
tenThietLap:'Thời gian cho phép đợi thanh toán',
giaTri:5,
donVi:'Phút'
},
{
tenThietLap:'Thời gian hủy đăng ký cho 1 lớp học đợi thanh toán',
giaTri:15,
donVi:'Phút'
},
{
tenThietLap:'Khoản phí ghi danh (% học phí)',
giaTri:20,
donVi:'%'
},

];

}