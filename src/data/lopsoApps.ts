// Other lopso.vn products shown to parents and teachers in the Parent Corner.
// Absolute links so they also work when this app is hosted somewhere else.
export const LOPSO_HOME = 'https://lopso.vn/';

export interface LopsoApp {
  id: string;
  icon: string;
  name: string;
  audience: string;
  description: string;
  url: string;
  cta: string;
}

export const LOPSO_APPS: LopsoApp[] = [
  {
    id: 'english-adventure',
    icon: '🗺️',
    name: 'English Adventure',
    audience: 'Tiếng Anh A1 · Học sinh lớp 6–9',
    description: 'Học tiếng Anh như chơi game: 14 thế giới, 42 bài và những trận đấu trùm.',
    url: 'https://lopso.vn/hoc-sinh/english-adventure/',
    cta: 'Cho con học thử',
  },
  {
    id: 'giao-vien',
    icon: '🧑‍🏫',
    name: 'Soạn bài giảng lopso',
    audience: 'Dành cho thầy cô',
    description: 'Biến PowerPoint thành bài giảng tương tác, có AI hỗ trợ, xuất SCORM cho LMS.',
    url: 'https://lopso.vn/giao-vien',
    cta: 'Thầy cô dùng thử miễn phí',
  },
];

export const LOPSO_LINKS = [
  { label: 'Trang chủ lopso.vn', url: LOPSO_HOME },
  { label: 'Điều khoản sử dụng', url: 'https://lopso.vn/dieu-khoan' },
  { label: 'Chính sách bảo mật', url: 'https://lopso.vn/chinh-sach-bao-mat' },
  { label: 'Liên hệ', url: 'mailto:minhmanteach@gmail.com' },
];
