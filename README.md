# KZMD128 — Progress, Every Day.

Bản nâng cấp trực tiếp của website Roadmap gốc (HTML/CSS/JavaScript + PWA), giữ nguyên Roadmap, English, Capy và dữ liệu Study cũ. Tính năng **Daily** thay thế Study trong thanh chuyển trang.

## Bắt đầu

Bạn có thể chạy website bằng một web server tĩnh, không cần build framework:

```bash
# Tại thư mục chứa index.html
python -m http.server 8000
```

Truy cập **http://localhost:8000/** trên trình duyệt. Để cài PWA trên điện thoại, dùng **HTTPS** hoặc host có HTTPS (ví dụ GitHub Pages). Mở trực tiếp `file://` không phải cách kiểm thử Service Worker / PWA hợp lệ.

### Cập nhật website GitHub Pages hiện có

1. **Sao lưu JSON dữ liệu đang có trên trình duyệt trước khi cập nhật** (nút sao lưu/khôi phục trên Roadmap cũ).
2. Copy **toàn bộ nội dung** thư mục này vào thư mục được GitHub Pages triển khai (`index.html`, `daily.css`, `daily.js`, `sw.js`, `manifest.webmanifest`, `icons/`, `brand/`). Giữ nguyên cấu trúc đường dẫn.
3. Commit/push và chờ GitHub Pages cập nhật. Mở lại site bằng kết nối mạng một lần để Service Worker mới cập nhật cache `kzmd128-offline-v3`.
4. Kiểm tra rằng Roadmap/English vẫn hiển thị dữ liệu cũ; chuyển sang Daily và thử tạo một mục tiêu ngắn.
5. Nếu cần khôi phục, bấm nút **Sao lưu / Khôi phục** trong Daily rồi chọn file JSON đã tải.

Không xóa dữ liệu website trong phần cài đặt trình duyệt. `localStorage` được gắn với domain/origin; thay domain hoặc mở site trên thiết bị mới sẽ không tự mang theo dữ liệu. Hãy xuất/nhập JSON để chuyển dữ liệu.

## Hệ thống Daily

- **Today**: nhiệm vụ theo lịch, checkbox / quantity / percentage / checklist, thống kê số hoàn thành và trung bình tiến độ. Không tạo dữ liệu mẫu cho Daily.
- **Day Roadmap**: Day tăng theo *ngày lịch* từ ngày bắt đầu; giới hạn ở tổng số Day. Bỏ lỡ một Day không làm chậm Day tiếp theo. Lộ trình kết thúc có tóm tắt số Day hoàn thành/chưa hoàn thành.
- **Pending Days**: tính toán từ ngày đã lên lịch và tiến độ; giữ lại lịch sử cũ mà không tạo hàng loạt bản ghi rỗng. Có thể hoàn thành bù; ngày hoàn thành thực tế (`completedOn`, `completedAt`) được lưu riêng.
- **Daily Journal**: `What I Did`, `What I Learned`, `Personal Notes` theo ngày, tự lưu cục bộ; không ảnh hưởng màu Calendar hoặc trạng thái To-do.
- **Calendar**: xanh = hoàn thành; vàng = có tiến độ trong ngày; đỏ = các ngày qua còn nhiệm vụ chưa xong; xám = không có nhiệm vụ/tương lai. Dấu ↗ = có hoàn thành bù; dấu chấm = có nhật ký.
- **Mục tiêu linh hoạt**: lịch `daily / roadmap / weekly / once` kết hợp độc lập tiến độ `checkbox / quantity / percentage / checklist`. Mặc định Checkbox.
- **Quản lý mục tiêu**: sửa, lưu trữ/khôi phục, xóa có xác nhận. Chỉnh sửa tạo phiên bản cấu hình có hiệu lực từ ngày hiện tại, không tính lại lịch các ngày trước; các bản ghi đã có lưu snapshot target/checklist.

## Cấu trúc dữ liệu và bảo vệ lịch sử

Giữ khóa `rm_v2` và mọi thành phần cũ của đối tượng `D`:

```json
{
  "nodes": [],
  "words": [],
  "study": { "days": {} },
  "cfg": {},
  "daily": {
    "version": 1,
    "goals": [],
    "records": {},
    "journals": {},
    "cfg": { "selected": "2026-11-18", "month": "2026-11" }
  }
}
```

Đây là ví dụ **cấu trúc dữ liệu**, không phải dữ liệu khởi tạo của người dùng. `goals[].versions` chứa cấu hình theo ngày hiệu lực; khóa `records` là `goalId|YYYY-MM-DD`. Không có bản ghi cho ngày chưa được cập nhật; Pending được tính theo lịch.

Study cũ vẫn tồn tại trong `D.study.days` và được đưa vào file backup; giao diện Study không còn trong thanh điều hướng. Không có chuyển đổi Study sang Daily vì cách đo thời gian học khác cách đo Daily.

Nếu bạn làm xong một ngày cũ vào hôm nay, bản ghi lưu **ngày được giao** và **ngày hoàn thành thực tế**. Streak và tỷ lệ đúng hạn chỉ tính bản ghi hoàn thành vào đúng ngày được giao. Ngày hoàn thành bù có thể chuyển Calendar thành xanh nhưng kèm dấu muộn.

### Sao lưu và khôi phục

Nút **Sao lưu / Khôi phục** xuất/nhập toàn bộ `D` dưới dạng JSON. Chức năng nhập hỏi xác nhận trước khi thay dữ liệu và chấp nhận bản backup trước đây không có `daily`. Bạn nên tải bản sao lưu trước khi nhập bản khác; dữ liệu nằm **trên trình duyệt**, không tự đồng bộ đám mây.

## Tệp nguồn

| Tệp | Vai trò |
|---|---|
| `index.html` | Ứng dụng gốc, tích hợp điều hướng và vùng Daily |
| `daily.css` | Thiết kế Liquid Glass dành cho Daily, responsive |
| `daily.js` | Lịch mục tiêu, tiến độ, pending, journal, calendar, stats, UI |
| `manifest.webmanifest` | Tên thương hiệu và PWA icon mới |
| `sw.js` | Network-first, precache shell và xóa cache cũ |
| `icons/*` | PNG favicon, app icons, maskable, Apple Touch Icon |
| `brand/*` | SVG logo, wordmark, biến thể sáng/tối và brand guide |
| `build_brand.py` | Script dựng SVG/PNG của bộ nhận diện (chỉ dùng khi cần tái tạo asset) |
| `TEST_REPORT.md` | Các kiểm thử thực tế và giới hạn kiểm thử |
| `tests/*` | Các bài kiểm thử Playwright có thể chạy lại bằng Python |

## Lưu ý

Website không có backend; thay đổi đồng hồ/múi giờ trên máy có thể làm thay đổi ngày hiện hành theo đồng hồ thiết bị. Hệ thống tính Day theo ngày lịch địa phương, đối chiếu lại khi mở tab và mỗi 12 giây khi đang chạy, nhưng không thể xác minh đồng hồ thiết bị là chính xác tuyệt đối nếu không có máy chủ thời gian tin cậy.

Dịch vụ bên ngoài của các tính năng có sẵn (AI/YouTube/font) có thể cần mạng; không ảnh hưởng cơ chế cục bộ của Daily. Nhập API key vào chatbot thuộc mã nguồn cũ, không phải tính năng Daily.

## Bản tinh chỉnh thiết kế v4 (18/11/2026)

- **Logo mới:** biểu tượng chữ K hình học cách điệu (split-K), không còn biểu tượng đường bậc thang cũ. Bộ icon v4 có tên file riêng để tránh hiện favicon/PWA cũ do cache.
- **Modal Thêm mục tiêu:** đã sửa lỗi biến màu ngoài vùng Daily khiến modal trong suốt. Nền trắng đục ở Light Mode / xanh đậm đục ở Dark Mode, độ tương phản chữ và ô nhập cao hơn.
- **Cột phải:** thu hẹp Calendar/Journal ở desktop còn khoảng 305–342px, chuyển header lịch thành bố cục hai tầng và giảm shadow/bo góc; không nén nội dung quá mức.
- **Không thay đổi cấu trúc dữ liệu Daily hoặc khóa `rm_v2`** trong bản tinh chỉnh giao diện này.

### Mở website bằng index.html

Giải nén ZIP, mở thư mục `KZMD128` và **nhấp đúp `index.html`**. Phải giữ cùng chỗ `daily.js`, `daily.css`, `icons/`, `brand/`, `manifest.webmanifest` và `sw.js`. Cách này dùng để xem thử trang trên máy tính; để cài PWA/offline đúng cách, dùng HTTPS/GitHub Pages. Nếu thấy icon cũ, phải dùng bản ZIP mới (icon `*-v4.png`) và kiểm tra không còn mở bản index cũ ở thư mục khác. Cập nhật lại bản đang host bằng cách upload toàn bộ thư mục mới.
