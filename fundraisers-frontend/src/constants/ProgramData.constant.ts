export interface ProgramType {
  id: string;
  name: string;
  picName: string;
  address: string;
  desc: string;
  category: 'Sociaty' | 'Environment' | 'Technology' | 'Health' | 'Education' | 'Emergency' | 'Animals' | 'Sports' | 'Arts' | 'Culture' | 'Religious' ;
  programLink: string;
  budget: number;
  photoUrl: string;
  createdAt: string;
  status: 'INACTIVE' |  'REGISTERED' |  'ALLOCATED' | 'DONE';
}

export const dummyData: ProgramType[] = [
  {
    id: '1',
    name: 'Bantuan Sosial Ramadan',
    picName: 'Ahmad Reza Radiant',
    address: '0xA123456789abcdef',
    desc: 'Menggalang dana untuk paket sembako keluarga kurang mampu selama Ramadan.',
    category: 'Sociaty',
    programLink: 'https://example.com/ramadan',
    budget: 1000000,
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-01T08:00:00Z',
    status : 'REGISTERED'
  },
  {
    id: '2',
    name: 'Penanaman 1000 Pohon',
    picName: 'Budi Santoso',
    address: '0xB987654321fedcba',
    desc: 'Program reboisasi di daerah gersang untuk mengurangi polusi udara.',
    category: 'Environment',
    programLink: 'https://example.com/trees',
    budget: 2000000,
    photoUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-03T09:30:00Z',
    status : 'REGISTERED',
  },
  {
    id: '3',
    name: 'Teknologi untuk Difabel',
    picName: 'Sari Wulandari',
    address: '0xCabc1234ef567890',
    desc: 'Pengembangan aplikasi bantu baca untuk anak berkebutuhan khusus.',
    category: 'Technology',
    programLink: 'https://example.com/tech-aid',
    budget: 1500000,
    photoUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-05T10:00:00Z',
    status : 'REGISTERED'
  },
  {
    id: '4',
    name: 'Bantu Pasien Kanker',
    picName: 'Dr. Indra Wijaya',
    address: '0xD321fedcba654321',
    desc: 'Penggalangan dana untuk pasien kanker yang tidak mampu.',
    category: 'Health',
    programLink: 'https://example.com/cancer-support',
    budget: 3000000,
    photoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-06T14:20:00Z',
    status : 'REGISTERED'
  },
  {
    id: '5',
    name: 'Beasiswa Anak Nelayan',
    picName: 'Maya Putri',
    address: '0xE456789abcdef012',
    desc: 'Membantu pendidikan anak-anak nelayan di daerah pesisir.',
    category: 'Education',
    programLink: 'https://example.com/scholarship',
    budget: 2500000,
    photoUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-07T08:00:00Z',
    status : 'REGISTERED'
  },
  {
    id: '6',
    name: 'Bencana Gempa Lombok',
    picName: 'Relawan Indonesia',
    address: '0xF654321098765432',
    desc: 'Bantuan logistik dan tempat tinggal bagi korban gempa di Lombok.',
    category: 'Emergency',
    programLink: 'https://example.com/lombok',
    budget: 5000000,
    photoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-08T07:45:00Z',
    status : 'REGISTERED'
  },
  {
    id: '7',
    name: 'Perawatan Anjing Terlantar',
    picName: 'Komunitas AnimalCare',
    address: '0xG1111222233334444',
    desc: 'Memberikan tempat tinggal dan makanan bagi hewan terlantar.',
    category: 'Animals',
    programLink: 'https://example.com/animals',
    budget: 1200000,
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-09T13:00:00Z',
    status : 'REGISTERED'
  },
  {
    id: '8',
    name: 'Sepak Bola untuk Desa',
    picName: 'Arif Kurniawan',
    address: '0xH5555666677778888',
    desc: 'Membangun fasilitas olahraga di desa terpencil.',
    category: 'Sports',
    programLink: 'https://example.com/sports',
    budget: 1000000,
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-10T16:10:00Z',
    status : 'REGISTERED'
  },
  {
    id: '9',
    name: 'Pelestarian Wayang Kulit',
    picName: 'Komunitas Budaya Nusantara',
    address: '0xI9999000011112222',
    desc: 'Mendukung seniman wayang kulit dan kegiatan edukatif.',
    category: 'Culture',
    programLink: 'https://example.com/wayang',
    budget: 800000,
    photoUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-11T12:00:00Z',
    status : 'REGISTERED'
  },
  {
    id: '10',
    name: 'Renovasi Masjid Tua',
    picName: 'Ustadz Hasan',
    address: '0xJ3333444455556666',
    desc: 'Renovasi masjid tua yang menjadi pusat ibadah dan kegiatan masyarakat.',
    category: 'Religious',
    programLink: 'https://example.com/masjid',
    budget: 2200000,
    photoUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-05-12T09:00:00Z',
    status : 'REGISTERED'
  }
]

