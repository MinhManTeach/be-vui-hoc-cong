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
npx vite build --base=/hoc-sinh/be-vui-hoc-cong/
```

Rồi chép thư mục `dist` vào `APPS_DIR/be-vui-hoc-cong/dist` trên máy chủ.

## Giọng đọc

Ứng dụng miễn phí nên chỉ dùng giọng tiếng Việt có sẵn trên thiết bị (Web Speech API), không gọi dịch vụ giọng đọc trả phí và không cần mạng để đọc. Nếu thiết bị chưa có giọng tiếng Việt, ứng dụng vẫn chạy bình thường nhưng im lặng; Góc phụ huynh hướng dẫn cách cài giọng.
