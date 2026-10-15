# Bé Vui Học Cộng

Game toán miễn phí cho trẻ 4–6 tuổi: học phép cộng qua đếm, gộp nhóm và tạo 10 cùng Thỏ Bông. Ứng dụng là một phần của hệ sinh thái lopso.vn; trong Góc phụ huynh (sau câu hỏi kiểm tra người lớn) có giới thiệu các ứng dụng khác của lopso.vn.

## Chạy thử trên máy

```
npm ci
npm run dev        # http://localhost:3000
npm test           # kiểm thử
npm run typecheck
```

## Đưa lên lopso.vn

Máy chủ của e-learning-studio phục vụ ứng dụng ở `/hoc-sinh/be-vui-hoc-cong/` (xem `docs/TRIEN_KHAI.md` trong repo đó). Build với đúng địa chỉ:

```
GOOGLE_TTS_API_KEY=... npx vite build --base=/hoc-sinh/be-vui-hoc-cong/
```

Rồi chép thư mục `dist` vào `APPS_DIR/be-vui-hoc-cong/dist` trên máy chủ.

Lưu ý: ứng dụng quyết định có dùng giọng đọc Google hay không **lúc build**, dựa vào việc có biến `GOOGLE_TTS_API_KEY` hay không. Khoá không bị đưa vào mã chạy trên trình duyệt, chỉ một cờ bật/tắt. Nếu build mà thiếu biến này thì ứng dụng luôn dùng giọng của trình duyệt, kể cả khi máy chủ đã có khoá.
