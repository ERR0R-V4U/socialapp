/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RamadanDay {
  ramadan: number;
  date: string;
  day: string;
  sehri: string; // HH:mm
  iftar: string;  // HH:mm
}

export interface District {
  name: string;
  bnName: string;
  sehriOffset: number; // minutes
  iftarOffset: number; // minutes
}

export const DISTRICTS: District[] = [
  { name: "Dhaka", bnName: "ঢাকা", sehriOffset: 0, iftarOffset: 0 },
  { name: "Chittagong", bnName: "চট্টগ্রাম", sehriOffset: -5, iftarOffset: -5 },
  { name: "Sylhet", bnName: "সিলেট", sehriOffset: -2, iftarOffset: -7 },
  { name: "Rajshahi", bnName: "রাজশাহী", sehriOffset: 7, iftarOffset: 6 },
  { name: "Khulna", bnName: "খুলনা", sehriOffset: 3, iftarOffset: 3 },
  { name: "Barisal", bnName: "বরিশাল", sehriOffset: 1, iftarOffset: 2 },
  { name: "Rangpur", bnName: "রংপুর", sehriOffset: 5, iftarOffset: 2 },
  { name: "Mymensingh", bnName: "ময়মনসিংহ", sehriOffset: 0, iftarOffset: -1 },
  { name: "Comilla", bnName: "কুমিল্লা", sehriOffset: -2, iftarOffset: -2 },
  { name: "Gazipur", bnName: "গাজীপুর", sehriOffset: 0, iftarOffset: 0 },
  { name: "Narayanganj", bnName: "নারায়ণগঞ্জ", sehriOffset: 0, iftarOffset: 0 },
  { name: "Bogra", bnName: "বগুড়া", sehriOffset: 4, iftarOffset: 3 },
  { name: "Dinajpur", bnName: "দিনাজপুর", sehriOffset: 7, iftarOffset: 4 },
  { name: "Jessore", bnName: "যশোর", sehriOffset: 4, iftarOffset: 4 },
  { name: "Cox's Bazar", bnName: "কক্সবাজার", sehriOffset: -5, iftarOffset: -4 },
];

// Base schedule for Dhaka 2026 (Estimated)
// Ramadan 2026 starts approx Feb 18
export const DHAKA_SCHEDULE: RamadanDay[] = [
  { ramadan: 1, date: "18 Feb", day: "Wednesday", sehri: "05:15", iftar: "17:55" },
  { ramadan: 2, date: "19 Feb", day: "Thursday", sehri: "05:14", iftar: "17:56" },
  { ramadan: 3, date: "20 Feb", day: "Friday", sehri: "05:13", iftar: "17:56" },
  { ramadan: 4, date: "21 Feb", day: "Saturday", sehri: "05:12", iftar: "17:57" },
  { ramadan: 5, date: "22 Feb", day: "Sunday", sehri: "05:11", iftar: "17:57" },
  { ramadan: 6, date: "23 Feb", day: "Monday", sehri: "05:10", iftar: "17:58" },
  { ramadan: 7, date: "24 Feb", day: "Tuesday", sehri: "05:09", iftar: "17:58" },
  { ramadan: 8, date: "25 Feb", day: "Wednesday", sehri: "05:08", iftar: "17:59" },
  { ramadan: 9, date: "26 Feb", day: "Thursday", sehri: "05:07", iftar: "17:59" },
  { ramadan: 10, date: "27 Feb", day: "Friday", sehri: "05:06", iftar: "18:00" },
  { ramadan: 11, date: "28 Feb", day: "Saturday", sehri: "05:05", iftar: "18:00" },
  { ramadan: 12, date: "01 Mar", day: "Sunday", sehri: "05:04", iftar: "18:01" },
  { ramadan: 13, date: "02 Mar", day: "Monday", sehri: "05:03", iftar: "18:01" },
  { ramadan: 14, date: "03 Mar", day: "Tuesday", sehri: "05:02", iftar: "18:02" },
  { ramadan: 15, date: "04 Mar", day: "Wednesday", sehri: "05:01", iftar: "18:02" },
  { ramadan: 16, date: "05 Mar", day: "Thursday", sehri: "05:00", iftar: "18:03" },
  { ramadan: 17, date: "06 Mar", day: "Friday", sehri: "04:59", iftar: "18:03" },
  { ramadan: 18, date: "07 Mar", day: "Saturday", sehri: "04:58", iftar: "18:04" },
  { ramadan: 19, date: "08 Mar", day: "Sunday", sehri: "04:57", iftar: "18:04" },
  { ramadan: 20, date: "09 Mar", day: "Monday", sehri: "04:56", iftar: "18:05" },
  { ramadan: 21, date: "10 Mar", day: "Tuesday", sehri: "04:55", iftar: "18:05" },
  { ramadan: 22, date: "11 Mar", day: "Wednesday", sehri: "04:54", iftar: "18:06" },
  { ramadan: 23, date: "12 Mar", day: "Thursday", sehri: "04:53", iftar: "18:06" },
  { ramadan: 24, date: "13 Mar", day: "Friday", sehri: "04:52", iftar: "18:07" },
  { ramadan: 25, date: "14 Mar", day: "Saturday", sehri: "04:51", iftar: "18:07" },
  { ramadan: 26, date: "15 Mar", day: "Sunday", sehri: "04:50", iftar: "18:08" },
  { ramadan: 27, date: "16 Mar", day: "Monday", sehri: "04:49", iftar: "18:08" },
  { ramadan: 28, date: "17 Mar", day: "Tuesday", sehri: "04:48", iftar: "18:09" },
  { ramadan: 29, date: "18 Mar", day: "Wednesday", sehri: "04:47", iftar: "18:09" },
  { ramadan: 30, date: "19 Mar", day: "Thursday", sehri: "04:46", iftar: "18:10" },
];

export const BENGALI_DAYS: Record<string, string> = {
  "Monday": "সোমবার",
  "Tuesday": "মঙ্গলবার",
  "Wednesday": "বুধবার",
  "Thursday": "বৃহস্পতিবার",
  "Friday": "শুক্রবার",
  "Saturday": "শনিবার",
  "Sunday": "রবিবার",
};

export const BENGALI_NUMBERS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
};

export const toBengaliNumber = (num: number | string): string => {
  return num.toString().split('').map(d => BENGALI_NUMBERS[d] || d).join('');
};
