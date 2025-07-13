// constants/ProgramData.constant.ts
export interface ProgramType {
  id: number | string;
  name: string;
  picName: string;
  desc: string;
  category: 'Society' | 'Environment' | 'Technology' | 'Health' | 'Education' | 'Emergency' | 'Animals' | 'Sports' | 'Arts' | 'Culture' | 'Religious';
  pic: string;
  target: string;
  allocated: string;
  status: number;
  programLink: string;
  photoUrl: string;
  createdAt: string;
}

// Export CategoryType yang missing
export type CategoryType = ProgramType['category'];

export enum ProgramStatus {
  INACTIVE = 0,
  REGISTERED = 1, 
  ALLOCATED = 2,
  DONE = 3
}

// Optional: Export array of valid categories for easier use
export const VALID_CATEGORIES: CategoryType[] = [
  'Society', 
  'Environment', 
  'Technology', 
  'Health', 
  'Education', 
  'Emergency', 
  'Animals', 
  'Sports', 
  'Arts', 
  'Culture', 
  'Religious'
];

// If you want to uncomment and fix the dummy data, here's the corrected version:
export const dummyData: ProgramType[] = [
  {
    id: '1',
    name: 'Bantuan Sosial Ramadan',
    picName: 'Ahmad Reza Radiant',
    pic: '0xA123456789abcdef', // Changed from 'address' to 'pic'
    desc: 'Menggalang dana untuk paket sembako keluarga kurang mampu selama Ramadan.',
    category: 'Society',
    programLink: 'https://example.com/ramadan',
    target: '1000000', // Changed from 'budget' to 'target' as string
    allocated: '250000', // Added allocated field
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-01T08:00:00Z',
    status: 1 // Changed to number
  },
  {
    id: '2',
    name: 'Penanaman 1000 Pohon',
    picName: 'Budi Santoso',
    pic: '0xB987654321fedcba',
    desc: 'Program reboisasi di daerah gersang untuk mengurangi polusi udara.',
    category: 'Environment',
    programLink: 'https://example.com/trees',
    target: '2000000',
    allocated: '500000',
    photoUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-03T09:30:00Z',
    status: 1
  },
  {
    id: '3',
    name: 'Teknologi untuk Difabel',
    picName: 'Sari Wulandari',
    pic: '0xCabc1234ef567890',
    desc: 'Pengembangan aplikasi bantu baca untuk anak berkebutuhan khusus.',
    category: 'Technology',
    programLink: 'https://example.com/tech-aid',
    target: '1500000',
    allocated: '750000',
    photoUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-05T10:00:00Z',
    status: 1
  },
  {
    id: '4',
    name: 'Bantu Pasien Kanker',
    picName: 'Dr. Indra Wijaya',
    pic: '0xD321fedcba654321',
    desc: 'Penggalangan dana untuk pasien kanker yang tidak mampu.',
    category: 'Health',
    programLink: 'https://example.com/cancer-support',
    target: '3000000',
    allocated: '1200000',
    photoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-06T14:20:00Z',
    status: 1
  },
  {
    id: '5',
    name: 'Beasiswa Anak Nelayan',
    picName: 'Maya Putri',
    pic: '0xE456789abcdef012',
    desc: 'Membantu pendidikan anak-anak nelayan di daerah pesisir.',
    category: 'Education',
    programLink: 'https://example.com/scholarship',
    target: '2500000',
    allocated: '800000',
    photoUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-07T08:00:00Z',
    status: 1
  },
  {
    id: '6',
    name: 'Bencana Gempa Lombok',
    picName: 'Relawan Indonesia',
    pic: '0xF654321098765432',
    desc: 'Bantuan logistik dan tempat tinggal bagi korban gempa di Lombok.',
    category: 'Emergency',
    programLink: 'https://example.com/lombok',
    target: '5000000',
    allocated: '2000000',
    photoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-08T07:45:00Z',
    status: 1
  },
  {
    id: '7',
    name: 'Perawatan Anjing Terlantar',
    picName: 'Komunitas AnimalCare',
    pic: '0xG1111222233334444',
    desc: 'Memberikan tempat tinggal dan makanan bagi hewan terlantar.',
    category: 'Animals',
    programLink: 'https://example.com/animals',
    target: '1200000',
    allocated: '300000',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-09T13:00:00Z',
    status: 1
  },
  {
    id: '8',
    name: 'Sepak Bola untuk Desa',
    picName: 'Arif Kurniawan',
    pic: '0xH5555666677778888',
    desc: 'Membangun fasilitas olahraga di desa terpencil.',
    category: 'Sports',
    programLink: 'https://example.com/sports',
    target: '1000000',
    allocated: '400000',
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-10T16:10:00Z',
    status: 1
  },
  {
    id: '9',
    name: 'Pelestarian Wayang Kulit',
    picName: 'Komunitas Budaya Nusantara',
    pic: '0xI9999000011112222',
    desc: 'Mendukung seniman wayang kulit dan kegiatan edukatif.',
    category: 'Culture',
    programLink: 'https://example.com/wayang',
    target: '800000',
    allocated: '200000',
    photoUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-11T12:00:00Z',
    status: 1
  },
  {
    id: '10',
    name: 'Renovasi Masjid Tua',
    picName: 'Ustadz Hasan',
    pic: '0xJ3333444455556666',
    desc: 'Renovasi masjid tua yang menjadi pusat ibadah dan kegiatan masyarakat.',
    category: 'Religious',
    programLink: 'https://example.com/masjid',
    target: '2200000',
    allocated: '1100000',
    photoUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-12T09:00:00Z',
    status: 1
  }
];

// Helper functions for working with categories
export const isCategoryValid = (category: string): category is CategoryType => {
  return VALID_CATEGORIES.includes(category as CategoryType);
};

export const getCategoryDisplayName = (category: CategoryType): string => {
  const displayNames: Record<CategoryType, string> = {
    'Society': 'Sosial',
    'Environment': 'Lingkungan',
    'Technology': 'Teknologi',
    'Health': 'Kesehatan',
    'Education': 'Pendidikan',
    'Emergency': 'Darurat',
    'Animals': 'Hewan',
    'Sports': 'Olahraga',
    'Arts': 'Seni',
    'Culture': 'Budaya',
    'Religious': 'Keagamaan'
  };
  return displayNames[category];
};

export const getStatusDisplayName = (status: number): string => {
  switch (status) {
    case ProgramStatus.INACTIVE:
      return 'Tidak Aktif';
    case ProgramStatus.REGISTERED:
      return 'Terdaftar';
    case ProgramStatus.ALLOCATED:
      return 'Didanai';
    case ProgramStatus.DONE:
      return 'Selesai';
    default:
      return 'Status Tidak Dikenal';
  }
};