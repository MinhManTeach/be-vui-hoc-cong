import { BunnyAccessory } from '../types/math';

/**
 * The hero's shop. Prices are in stars the child has earned and not yet spent;
 * spending never lowers totalStars, so world unlocks and parent reports are unaffected.
 * Badges are not for sale: each one is earned by finishing a world's boss.
 */
export const REWARDS_CATALOG: BunnyAccessory[] = [
  // Mũ
  { id: 'hat_bow', name: 'Nơ Hồng Xinh', type: 'hat', emoji: '🎀', price: 3, description: 'Chiếc nơ hồng thật dễ thương!' },
  { id: 'hat_cap', name: 'Mũ Lưỡi Trai', type: 'hat', emoji: '🧢', price: 4, description: 'Đội lên là sẵn sàng đi chơi!' },
  { id: 'hat_flower', name: 'Vòng Hoa Mùa Xuân', type: 'hat', emoji: '🌼', price: 6, description: 'Vòng hoa cúc vàng tươi.' },
  { id: 'hat_party', name: 'Mũ Sinh Nhật', type: 'hat', emoji: '🥳', price: 6, description: 'Ăn mừng thật vui nào!' },
  { id: 'hat_chef', name: 'Mũ Đầu Bếp', type: 'hat', emoji: '👨‍🍳', price: 10, description: 'Đầu bếp nhí nấu món ngon!' },
  { id: 'hat_pirate', name: 'Mũ Thuyền Trưởng', type: 'hat', emoji: '🏴‍☠️', price: 12, description: 'Ra khơi tìm kho báu!' },
  { id: 'hat_crown', name: 'Vương Miện', type: 'hat', emoji: '👑', price: 18, description: 'Vua phép cộng tài ba!' },
  { id: 'hat_astronaut', name: 'Mũ Phi Hành Gia', type: 'hat', emoji: '🧑‍🚀', price: 20, description: 'Bay tới các vì sao!' },

  // Kính
  { id: 'glasses_heart', name: 'Kính Trái Tim', type: 'glasses', emoji: '❤️', price: 5, description: 'Thương bé thật nhiều!' },
  { id: 'glasses_smart', name: 'Kính Tròn Bác Học', type: 'glasses', emoji: '👓', price: 6, description: 'Đeo vào trông thông minh quá!' },
  { id: 'glasses_star', name: 'Kính Ngôi Sao', type: 'glasses', emoji: '⭐', price: 7, description: 'Mắt sáng lấp lánh như sao!' },
  { id: 'glasses_cool', name: 'Kính Râm Đi Biển', type: 'glasses', emoji: '🕶️', price: 8, description: 'Đi biển thật là ngầu!' },

  // Áo
  { id: 'shirt_sky', name: 'Áo Yếm Xanh', type: 'shirt', emoji: '👕', price: 0, description: 'Bộ đồ quen thuộc mỗi ngày.' },
  { id: 'shirt_stripe', name: 'Áo Thủy Thủ', type: 'shirt', emoji: '⛵', price: 6, description: 'Vượt sóng ra biển lớn!' },
  { id: 'shirt_dress', name: 'Váy Hoa Hồng', type: 'shirt', emoji: '👗', price: 8, description: 'Váy hoa xoè thật xinh!' },
  { id: 'shirt_aodai', name: 'Áo Dài Đỏ', type: 'shirt', emoji: '🧧', price: 12, description: 'Áo dài đón Tết thật đẹp!' },
  { id: 'shirt_hero', name: 'Áo Choàng Siêu Nhân', type: 'shirt', emoji: '🦸', price: 15, description: 'Siêu nhân giải cứu con số!' },
  { id: 'shirt_space', name: 'Đồ Phi Hành Gia', type: 'shirt', emoji: '🚀', price: 18, description: 'Du hành vũ trụ số học!' },

  // Ba lô
  { id: 'backpack_yellow', name: 'Ba Lô Vàng', type: 'backpack', emoji: '🎒', price: 0, description: 'Đựng sách vở và bút màu.' },
  { id: 'backpack_carrot', name: 'Ba Lô Cà Rốt', type: 'backpack', emoji: '🥕', price: 6, description: 'Ba lô hình củ cà rốt!' },
  { id: 'backpack_star', name: 'Ba Lô Ngôi Sao', type: 'backpack', emoji: '⭐', price: 10, description: 'Lấp lánh ánh sao!' },
  { id: 'backpack_rocket', name: 'Ba Lô Tên Lửa', type: 'backpack', emoji: '🚀', price: 15, description: 'Vút bay lên trời cao!' },

  // Đồ cầm tay
  { id: 'item_carrot', name: 'Củ Cà Rốt', type: 'item', emoji: '🥕', price: 0, description: 'Củ cà rốt giòn ngọt.' },
  { id: 'item_flower', name: 'Hoa Hướng Dương', type: 'item', emoji: '🌻', price: 4, description: 'Đóa hoa chào ngày mới!' },
  { id: 'item_balloon', name: 'Bóng Bay', type: 'item', emoji: '🎈', price: 5, description: 'Bay cao cùng ước mơ!' },
  { id: 'item_icecream', name: 'Kem Ốc Quế', type: 'item', emoji: '🍦', price: 5, description: 'Mát lạnh ngọt ngào!' },
  { id: 'item_magic_wand', name: 'Đũa Thần', type: 'item', emoji: '🪄', price: 12, description: 'Phép cộng dễ ợt!' },

  // Huy hiệu (không bán, nhận khi thắng boss)
  { id: 'badge_counting_star', name: 'Ngôi Sao Bé Đếm Giỏi', type: 'badge', emoji: '🎖️', price: 0, earnedBy: 'world_1_counting', description: 'Hoàn thành Vùng đất Bé Tập Đếm.' },
  { id: 'badge_super_addition', name: 'Siêu Sao Phép Cộng', type: 'badge', emoji: '🏅', price: 0, earnedBy: 'world_3_add_10', description: 'Hoàn thành Vùng đất Cộng Trong Phạm Vi 10.' },
  { id: 'badge_master_10', name: 'Cao Thủ Số 10', type: 'badge', emoji: '🏆', price: 0, earnedBy: 'world_4_make_10', description: 'Hoàn thành Vùng đất Ngôi Nhà Số 10.' },
  { id: 'badge_mental_master', name: 'Bậc Thầy Tính Nhẩm', type: 'badge', emoji: '💎', price: 0, earnedBy: 'world_6_over_10', description: 'Hoàn thành Vùng đất Cộng Vượt 10.' },
  { id: 'badge_cosmic', name: 'Nhà Toán Học Vũ Trụ', type: 'badge', emoji: '🪐', price: 0, earnedBy: 'all', description: 'Hoàn thành cả 6 vùng đất.' },
];
