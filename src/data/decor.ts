import type { WorldId } from '../types/math';
export type RoomZone = 'FLOOR' | 'WALL' | 'SHELF' | 'WINDOW';
export type DecorArtId = 'rug' | 'plant' | 'lamp' | 'picture' | 'cloud' | 'toybox' | 'books' | 'moon' | 'trophy' | 'flowers';
export type UnlockSource = { kind: 'starter' } | { kind: 'checkpoint'; receipt: string; world: WorldId; level: number } | { kind: 'days'; count: number };
export interface Decor { id: string; displayName: string; category: string; art: DecorArtId; zone: RoomZone; unlock: UnlockSource; unlockLabel: string; }
export const DECOR: readonly Decor[] = [
 {id:'decor_rug',displayName:'Thảm Cầu Vồng',category:'Thảm',art:'rug',zone:'FLOOR',unlock:{kind:'starter'},unlockLabel:'Món quà đầu tiên'},
 {id:'decor_plant',displayName:'Chậu Cây Nhỏ',category:'Cây',art:'plant',zone:'WINDOW',unlock:{kind:'starter'},unlockLabel:'Món quà đầu tiên'},
 {id:'decor_lamp',displayName:'Đèn Ngôi Sao',category:'Đèn',art:'lamp',zone:'SHELF',unlock:{kind:'starter'},unlockLabel:'Món quà đầu tiên'},
 {id:'decor_picture',displayName:'Tranh Khu Vườn',category:'Tranh',art:'picture',zone:'WALL',unlock:{kind:'checkpoint',receipt:'cp_world_1_3',world:'world_1_counting',level:3},unlockLabel:'Hoàn thành màn 3 Khu Vườn'},
 {id:'decor_cloud',displayName:'Gối Mây',category:'Gối',art:'cloud',zone:'FLOOR',unlock:{kind:'checkpoint',receipt:'cp_world_1_6',world:'world_1_counting',level:6},unlockLabel:'Hoàn thành màn 6 Khu Vườn'},
 {id:'decor_toybox',displayName:'Hộp Đồ Chơi',category:'Hộp',art:'toybox',zone:'FLOOR',unlock:{kind:'checkpoint',receipt:'cp_world_2_3',world:'world_2_merge',level:3},unlockLabel:'Hoàn thành màn 3 Rừng Gộp Nhóm'},
 {id:'decor_books',displayName:'Kệ Sách',category:'Sách',art:'books',zone:'SHELF',unlock:{kind:'checkpoint',receipt:'cp_world_3_5',world:'world_3_add_10',level:5},unlockLabel:'Hoàn thành màn 5 Đảo Phép Cộng'},
 {id:'decor_flowers',displayName:'Chậu Hoa',category:'Cây',art:'flowers',zone:'WINDOW',unlock:{kind:'days',count:3},unlockLabel:'Phiêu lưu 3 ngày'},
 {id:'decor_moon',displayName:'Đèn Mặt Trăng',category:'Đèn',art:'moon',zone:'SHELF',unlock:{kind:'days',count:7},unlockLabel:'Phiêu lưu 7 ngày'},
 {id:'decor_trophy',displayName:'Cúp Toán Học',category:'Cúp',art:'trophy',zone:'SHELF',unlock:{kind:'days',count:14},unlockLabel:'Phiêu lưu 14 ngày'},
];
export const ROOM_ZONES: readonly RoomZone[] = ['FLOOR','WALL','SHELF','WINDOW'];
export const ZONE_NAMES: Record<RoomZone,string> = {FLOOR:'Trên sàn',WALL:'Trên tường',SHELF:'Trên kệ',WINDOW:'Bên cửa sổ'};

export type PlacementType = 'FLOOR'|'WALL'|'SURFACE'|'FLEXIBLE';
export function placementType(decor:Decor):PlacementType {return decor.zone==='FLOOR'?'FLOOR':decor.zone==='WALL'?'WALL':decor.zone==='WINDOW'?'FLEXIBLE':'SURFACE';}
