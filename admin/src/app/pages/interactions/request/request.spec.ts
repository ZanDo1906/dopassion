import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactManagement, iContact } from './contact-management';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ContactManagement', () => {
  let component: ContactManagement;
  let fixture: ComponentFixture<ContactManagement>;
  let httpMock: HttpTestingController;

  // Dữ liệu giả lập khớp chuẩn cấu trúc models/contact.js
  const mockContacts: iContact[] = [
    {
      stt: 1,
      maLienHe: 'LH101',
      maKh: 'KH007',
      tenKhachHang: 'Nguyễn Tấn Dũng',
      noiDungLienHe: 'Tôi cần tư vấn lộ trình học IELTS từ con số 0.',
      trangThaiLienHe: 'Chờ xử lý',
      gmail: 'dungnguyen@gmail.com',
      soDienThoai: '0901234567'
    },
    {
      stt: 2,
      maLienHe: 'LH102',
      maKh: '', // Khách vãng lai
      tenKhachHang: 'Trần Gia Hân',
      noiDungLienHe: 'Hỏi về lịch khai giảng lớp TOEIC tháng sau.',
      trangThaiLienHe: 'Đã xử lý',
      gmail: 'giahan@gmail.com',
      soDienThoai: '0988776655'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ContactManagement]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactManagement);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Đảm bảo không còn request HTTP nào bị treo sau mỗi lượt kiểm thử
    httpMock.verify(); 
  });

  it('1. Khởi tạo thành công component', () => {
    expect(component).toBeTruthy();
  });

  it('2. Phải tự động gọi API lấy danh sách khi ngOnInit kích hoạt', () => {
    fixture.detectChanges(); // Kích hoạt ngOnInit

    const req = httpMock.expectOne('http://localhost:3000/api/contact');
    expect(req.request.method).toBe('GET');
    req.flush(mockContacts); // Đẩy dữ liệu giả lập vào luồng

    expect(component.contactList.length).toBe(2);
    expect(component.contactList).toEqual(mockContacts);
  });

  it('3. Phải hiển thị Pop-up modal và gán dữ liệu khi chọn xem chi tiết', () => {
    const contactSample = mockContacts[0];
    component.openViewModal(contactSample);

    expect(component.isModalOpen).toBeTrue();
    expect(component.selectedContact).toEqual(contactSample);
  });

  it('4. Phải xóa sạch biến tạm và ẩn Pop-up modal khi gọi hàm đóng', () => {
    component.isModalOpen = true;
    component.selectedContact = mockContacts[1];

    component.closeModal();

    expect(component.isModalOpen).toBeFalse();
    expect(component.selectedContact).toBeNull();
  });
});