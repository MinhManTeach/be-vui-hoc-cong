// Chạm lần đầu: thêm hình vào danh sách đã đếm. Chạm lại: bỏ đếm hình đó.
// Chỉ giữ những hình đang hiện trên màn (chỉ số < count), nên "Đã đếm" không bao giờ vượt quá số hình.
export function toggleTap(tapped: readonly number[], index: number, count: number): number[] {
  const visible = tapped.filter((i) => i >= 0 && i < count);
  if (index < 0 || index >= count) return visible;
  return visible.includes(index) ? visible.filter((i) => i !== index) : [...visible, index];
}
