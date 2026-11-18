# Thiết bị đang online – Ôn tập Văn hóa Việt Nam

Tính năng đã được kết nối với dự án Supabase có sẵn `ltn1` (project ref: `cwhbxtdaylxwzmpslhpr`).

## Đã cấu hình
- Bảng `public.online_devices` và `public.online_admins` đã được tạo.
- Row Level Security (RLS) đã bật; chỉ tài khoản có tên trong `online_admins` được đọc danh sách thiết bị.
- Edge Function `online-heartbeat` đã triển khai và đang ở trạng thái ACTIVE.
- Website đã được cấu hình URL và public anon key của Supabase trong `config.js`.
- Mỗi tab/trình duyệt gửi heartbeat 20 giây một lần; danh sách quản trị làm mới 10 giây một lần.
- Thiết bị được tính online khi heartbeat trong 60 giây gần nhất; bản ghi cũ được dọn sau 10 phút.

## Còn một bước bắt buộc: tạo tài khoản quản trị
Tôi không tạo mật khẩu thay bạn và không lưu mật khẩu trong mã nguồn. Hãy tạo một tài khoản quản trị trong Supabase:

1. Mở [Supabase Dashboard](https://supabase.com/dashboard/project/cwhbxtdaylxwzmpslhpr).
2. Vào **Authentication → Users → Add user → Create new user**.
3. Nhập email của bạn và tự đặt mật khẩu. Xác nhận email nếu Supabase yêu cầu.
4. Sao chép **User UID** của tài khoản vừa tạo.
5. Vào **SQL Editor**, chạy lệnh dưới đây, thay UUID bằng User UID vừa sao chép:

```sql
insert into public.online_admins (user_id)
values ('PASTE-USER-UID-HERE'::uuid)
on conflict (user_id) do nothing;
```

Sau đó mở website, chọn **Quản trị · Thiết bị đang online**, đăng nhập bằng email/mật khẩu vừa tạo.

## Các giới hạn cần biết
- Website nhận diện loại thiết bị, hệ điều hành và trình duyệt từ User-Agent; không thể đảm bảo lấy đúng tên model cụ thể.
- Mỗi tab có thể được tính là một phiên thiết bị riêng.
- Trạng thái online có thể trễ tối đa khoảng 60 giây sau khi đóng tab hoặc mất mạng.
- Endpoint heartbeat công khai chỉ nhận metadata thiết bị; không thu thập tên thật, email, số điện thoại hoặc nội dung người dùng. Vì endpoint chạy trên website công khai, dữ liệu online là chỉ báo hiện diện thực tế gần đúng, không phải cơ chế xác minh danh tính thiết bị.
- Không đưa secret key hoặc service_role key vào `config.js`. Key đang dùng ở frontend là public anon key.
