/**
 * Hari libur nasional & cuti bersama RESMI (SKB 3 Menteri).
 *
 * Sumber (diverifikasi 11 Nov 2026):
 * - 2026: SKB No. 1497, 2, 5 Tahun 2025
 *   https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2026
 * - 2027: SKB No. 1205, 3, 2 Tahun 2026
 *   https://www.setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2027
 *
 * CARA MEMPERBARUI (setahun sekali, biasanya SKB terbit sekitar September):
 * tambahkan blok tahun baru di bawah dengan format yang sama. Tahun yang belum ada
 * di sini otomatis memakai perkiraan (lihat estimate.ts) dan diberi label "perkiraan".
 */
export type HolidayKind = "libur" | "cuti"

export interface OfficialHoliday {
  /** YYYY-MM-DD */
  date: string
  name: string
  kind: HolidayKind
}

const L = (date: string, name: string): OfficialHoliday => ({ date, name, kind: "libur" })
const C = (date: string, name: string): OfficialHoliday => ({ date, name, kind: "cuti" })

export const OFFICIAL_HOLIDAYS: Record<number, OfficialHoliday[]> = {
  2026: [
    L("2026-01-01", "Tahun Baru 2026 Masehi"),
    L("2026-01-16", "Isra Mikraj Nabi Muhammad saw."),
    C("2026-02-16", "Cuti bersama Tahun Baru Imlek"),
    L("2026-02-17", "Tahun Baru Imlek 2577 Kongzili"),
    C("2026-03-18", "Cuti bersama Hari Suci Nyepi"),
    L("2026-03-19", "Hari Suci Nyepi (Tahun Baru Saka 1948)"),
    C("2026-03-20", "Cuti bersama Idulfitri"),
    L("2026-03-21", "Idulfitri 1447 H"),
    L("2026-03-22", "Idulfitri 1447 H"),
    C("2026-03-23", "Cuti bersama Idulfitri"),
    C("2026-03-24", "Cuti bersama Idulfitri"),
    L("2026-04-03", "Wafat Yesus Kristus"),
    L("2026-04-05", "Kebangkitan Yesus Kristus (Paskah)"),
    L("2026-05-01", "Hari Buruh Internasional"),
    L("2026-05-14", "Kenaikan Yesus Kristus"),
    C("2026-05-15", "Cuti bersama Kenaikan Yesus Kristus"),
    L("2026-05-27", "Iduladha 1447 H"),
    C("2026-05-28", "Cuti bersama Iduladha"),
    L("2026-05-31", "Hari Raya Waisak 2570 BE"),
    L("2026-06-01", "Hari Lahir Pancasila"),
    L("2026-06-16", "1 Muharam Tahun Baru Islam 1448 H"),
    L("2026-08-17", "Proklamasi Kemerdekaan"),
    L("2026-08-25", "Maulid Nabi Muhammad saw."),
    C("2026-12-24", "Cuti bersama Natal"),
    L("2026-12-25", "Kelahiran Yesus Kristus (Natal)"),
  ],
  2027: [
    L("2027-01-01", "Tahun Baru 2027 Masehi"),
    L("2027-01-05", "Isra Mikraj Nabi Muhammad saw."),
    C("2027-02-05", "Cuti bersama Tahun Baru Imlek"),
    L("2027-02-06", "Tahun Baru Imlek 2578 Kongzili"),
    L("2027-03-08", "Hari Suci Nyepi (Tahun Baru Saka 1949)"),
    C("2027-03-09", "Cuti bersama Idulfitri"),
    L("2027-03-10", "Idulfitri 1448 H"),
    L("2027-03-11", "Idulfitri 1448 H"),
    C("2027-03-12", "Cuti bersama Idulfitri"),
    C("2027-03-15", "Cuti bersama Idulfitri"),
    C("2027-03-25", "Cuti bersama Wafat Yesus Kristus"),
    L("2027-03-26", "Wafat Yesus Kristus"),
    L("2027-03-28", "Kebangkitan Yesus Kristus (Paskah)"),
    L("2027-05-01", "Hari Buruh Internasional"),
    L("2027-05-06", "Kenaikan Yesus Kristus"),
    L("2027-05-17", "Iduladha 1448 H"),
    C("2027-05-18", "Cuti bersama Iduladha"),
    C("2027-05-19", "Cuti bersama Waisak"),
    L("2027-05-20", "Hari Raya Waisak 2571 BE"),
    L("2027-06-01", "Hari Lahir Pancasila"),
    L("2027-06-06", "1 Muharam Tahun Baru Islam 1449 H"),
    L("2027-08-15", "Maulid Nabi Muhammad saw."),
    L("2027-08-17", "Proklamasi Kemerdekaan"),
    C("2027-12-24", "Cuti bersama Natal"),
    L("2027-12-25", "Kelahiran Yesus Kristus (Natal)"),
    L("2027-12-26", "Isra Mikraj Nabi Muhammad saw."),
  ],
}
