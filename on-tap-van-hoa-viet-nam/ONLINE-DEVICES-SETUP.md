# Thiết bị đang online – Ôn tập Văn hóa Việt Nam

Phần theo dõi dùng Supabase Auth + Postgres Row Level Security (RLS). Người truy cập được đăng nhập ẩn danh để gửi thông tin phiên thiết bị; chỉ tài khoản được cấp quyền trong bảng `online_admins` mới đọc được danh sách. Mục quản trị dùng email và mật khẩu Supabase Auth, không lưu mật khẩu trong mã nguồn.

## 1. Tạo dự án Supabase
1. Tạo dự án tại https://supabase.com/.
2. Vào **SQL Editor**, chạy toàn bộ nội dung trong file `supabase-online-devices.sql`.
3. Vào **Authentication → Sign In / Providers** và bật **Allow anonymous sign-ins**.
4. Vào **Authentication → Users**, tạo tài khoản email/mật khẩu dành riêng cho quản trị. Xác nhận email nếu dự án yêu cầu.

## 2. Cấp quyền quản trị
Sau khi tạo tài khoản quản trị, trở lại **SQL Editor** và chạy lệnh dưới đây, thay email bằng email vừa tạo:

```sql
insert into public.online_admins (user_id)
select id from auth.users where email = 'your-admin@email.com'
on conflict (user_id) do nothing;
```

Chỉ tài khoản có bản ghi trong `online_admins` mới xem được bảng thiết bị nhờ chính sách RLS. Không cấp quyền insert/update/delete cho bảng này từ trình duyệt.

## 3. Điền thông tin kết nối
1. Trong Supabase, mở **Project Connect** và sao chép **Project URL** cùng **Publishable key** (bắt đầu bằng `sb_publishable_`).
2. Mở file `config.js` trong repo và điền hai giá trị:
   - `window.VHVN_SUPABASE_URL`
   - `window.VHVN_SUPABASE_PUBLISHABLE_KEY`
3. Commit file `config.js` lên GitHub Pages.

Publishable key được thiết kế để dùng ở frontend. Tuyệt đối không đưa **Secret key** hoặc **service_role key** vào website.

## 4. Sử dụng
- Khách truy cập website được ghi nhận ẩn danh; không cần đăng ký tài khoản.
- Website gửi nhịp hoạt động mỗi 20 giây.
- Một thiết bị được coi là online nếu có nhịp hoạt động trong 60 giây gần nhất.
- Mở **Quản trị · Thiết bị đang online**, đăng nhập bằng email/mật khẩu quản trị để xem danh sách.
- Danh sách làm mới mỗi 10 giây.

## Giới hạn nhận diện
Trang web chỉ đọc được loại thiết bị, hệ điều hành và trình duyệt qua thông tin trình duyệt cung cấp. Ví dụ: iPhone, Điện thoại Android, Máy tính Windows; không đảm bảo nhận diện được model máy chính xác. Mỗi tab trình duyệt có thể được tính là một phiên truy cập riêng.
