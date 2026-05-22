import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [NgFor],
  templateUrl: './branch.html',
  styleUrls: ['./branch.css']
})

export class Branch {

  branches = [

    {
      stt: 1,
      maChiNhanh: 'CN1',
      tenChiNhanh: 'Chi nhánh Linh Tây - Thủ Đức',
      diaChi: '58/8, Đường Số 9, Khu phố 1, Linh Tây, Thủ Đức, TP.HCM'
    },

    {
      stt: 2,
      maChiNhanh: 'CN2',
      tenChiNhanh: 'Chi nhánh Linh Chiểu - Thủ Đức',
      diaChi: 'Số 113, Đường Chương Dương, Linh Chiểu, Thủ Đức, TP.HCM'
    },

    {
      stt: 3,
      maChiNhanh: 'CN3',
      tenChiNhanh: 'Chi nhánh Lê Văn Việt - Thủ Đức',
      diaChi: 'C26/5KS Đ. Lê Văn Việt, Tăng Nhơn Phú, Hồ Chí Minh, Việt Nam'
    }

  ];

}