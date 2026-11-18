# KZMD128 — Báo cáo kiểm thử

## Điều kiện

- **Ngày kiểm thử:** 18/11/2026.
- **Môi trường:** Chromium headless qua Playwright, HTML/CSS/JS thật; do trình duyệt sandbox không cho điều hướng đến HTTP/file URL, hai bộ kiểm thử đã **nạp HTML vào DOM và nhúng tài nguyên CSS/JS**, sử dụng localStorage mô phỏng trong bộ nhớ cùng đồng hồ ngày có thể giả lập để kiểm tra chuyển ngày. Cơ chế `save()` gốc được gọi và có dữ liệu JSON sau lưu.
- **Bộ kiểm thử:** `tests/test_daily_suite.py`, `tests/test_integration.py` (nằm trong gói mã nguồn, không cần upload khi triển khai).
- **Không có dữ liệu Daily mẫu trong bản triển khai.** Mục tiêu IELTS và các tên khác là dữ liệu tạm trong kiểm thử.

## Đã chạy thành công

1. Daily mở được từ navigation; Roadmap và English vẫn mở được; không gặp JavaScript runtime error.
2. Empty state Daily khi chưa tạo mục tiêu, không có dữ liệu mẫu.
3. IELTS 100 Day + Checkbox từ 18/11/2026: Day 1, không tự sinh nhiệm vụ con, tích một lần là hoàn thành.
4. Chuyển sang 19/11, Day 2 hiện ở Today và Day 1 nằm trong Pending.
5. Chuyển sang 21/11, Day 4 không bị giảm về Day 1; làm bù Day 1 đưa ra khỏi Pending và ghi `completedOn = 2026-11-21`.
6. Quantity 3/5 = 60%; 5/5 = 100%.
7. Percentage 75% chưa xong, 100% hoàn thành.
8. Checklist 2/3 = 66,7%, 3/3 = 100%.
9. Calendar chuyển xanh khi các mục tiêu đủ 100% **dù không viết Journal**.
10. Journal lưu nội dung; bỏ tích một mục tiêu chuyển ngày sang In Progress dù có Journal.
11. Mô phỏng quay lại ngày 25/11: IELTS hiển thị Day 8, các ngày cũ còn Pending.
12. Day 100 là 25/02/2027; không tạo Day 101 ngày 26/02/2027.
13. Weekly chỉ tạo ở ngày đã chọn, One-time chỉ tạo trong ngày đã định và thành Pending nếu chưa xong.
14. Thay chỉ tiêu Quantity cho ngày kế tiếp không thay bản ghi target của ngày trước (snapshot).
15. Export JSON có Daily, nhập lại JSON qua giao diện và xác nhận, so sánh dữ liệu Daily khớp đầy đủ.
16. Nhập backup cũ **không có Daily** vẫn hoạt động, giữ dữ liệu `D.study.days`.
17. Lưu trữ mục tiêu ngăn phát sinh mới, vẫn giữ lịch cũ.
18. Đổi Light/Dark không có lỗi JavaScript.
19. Layout và biểu mẫu Daily không tràn ngang tại 320, 375, 390, 430 và 768 px.
20. Chạy kiểm tra cú pháp `node --check` cho `daily.js` và `sw.js` thành công.

## Chưa kiểm chứng trong môi trường này

- Cài PWA và hoạt động offline qua **Service Worker thực tế** trên HTTPS/localhost, do trình duyệt sandbox chặn điều hướng HTTP/file. `sw.js` đã cập nhật và có precache nhưng **chưa xác nhận bằng bài test PWA độc lập**.
- Kiểm tra cảm ứng trên **iPhone/Android thật**, các hiệu ứng hệ thống và safe-area theo hệ điều hành. Responsive đã được kiểm tra bằng viewport Chromium giả lập.
- Chuyển ngày đúng **00:00 thực** với ứng dụng mở nhiều giờ; kiểm thử đã giả lập chuyển ngày qua đồng hồ thử nghiệm và gọi cơ chế tự đồng bộ.
- Kiểm thử tích hợp với dữ liệu riêng của người dùng, vì dữ liệu người dùng không được cung cấp trong localStorage trình duyệt kiểm thử. Chỉ xác nhận đường đi sao lưu/khôi phục và cấu trúc cũ.

Các hạn chế trên không được coi là kiểm thử đã thông qua.

## UI/brand regression — v4 (18/11/2026)

- Chromium desktop 1440 × 900: giao diện Daily và modal xem trực quan, modal nền computed `rgb(255,255,255)`, input `rgb(246,248,252)`, cột phải 342px.
- Chromium desktop Dark Mode: modal nền xanh than đậm, ô nhập và chữ sáng rõ; ảnh lưu `KZMD128-v4-modal-dark.png` (bên ngoài gói web).
- Chạy lại `tests/test_daily_suite.py` và `tests/test_integration.py`: tất cả case thông qua, bao gồm viewport mobile 320–768px (không tràn ngang). Kiểm thử cài PWA thực tế vẫn chưa thực hiện.
