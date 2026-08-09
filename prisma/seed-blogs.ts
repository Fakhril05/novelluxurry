import { db } from '../src/lib/db';

async function main() {
  const blogs = [
    {
      title: '10 Novel Indonesia Terbaik 2024 yang Wajib Dibaca',
      titleEn: '10 Best Indonesian Novels of 2024 You Must Read',
      slug: 'novel-indonesia-terbaik-2024',
      excerpt: 'Daftar rekomendasi novel Indonesia terbaik tahun 2024 dari berbagai genre yang wajib ada di koleksi pembaca Anda.',
      excerptEn: 'A curated list of the best Indonesian novels of 2024 across various genres that deserve a spot in your collection.',
      content: '<h2>Tahun Luar Biasa untuk Sastra Indonesia</h2><p>Tahun 2024 menjadi tahun yang luar biasa untuk dunia sastra Indonesia. Banyak penulis muda berbakat yang muncul dengan karya-karya segar dan menarik. Berikut adalah 10 novel yang wajib Anda baca.</p><h2>1. Bumi Manusia oleh Pramoedya Ananta Toer (Edisi Reissue)</h2><p>Klasik ini terus menginspirasi generasi baru. Edisi khusus 2024 menampilkan konten yang dipulihkan dan komentar baru dari para ahli sastra.</p><h2>2. Perahu Kertas oleh Dee Lestari (Edisi Khusus)</h2><p>Dee Lestari kembali dengan edisi khusus yang mencakup bab yang belum pernah dipublikasikan. Kisah Kugy dan Keenan terus mencuri hati.</p><h2>3. Filosofi Teras oleh Henry Manampiring</h2><p>Henry Manampiring berhasil membuat filosofi Stoikisme mudah dipahami melalui novel ini. Buku yang awalnya dianggap niche kini menjadi fenomena.</p><h2>4. Laut Bercerita oleh Leila S. Chudori</h2><p>Novel yang powerful tentang aktivis yang hilang selama era Orde Baru. Karya yang wajib dibaca untuk memahami sejarah Indonesia.</p><h2>5. Hujan oleh Tere Liye</h2><p>Tere Liye kembali dengan novel yang penuh emosi. Hujan menceritakan tentang persahabatan dan cinta di tengah kesulitan hidup.</p>',
      contentEn: '<h2>An Extraordinary Year for Indonesian Literature</h2><p>The year 2024 has been extraordinary for Indonesian literature. Many talented young writers have emerged with fresh and captivating works. Here are 10 novels you must read.</p><h2>1. Bumi Manusia by Pramoedya Ananta Toer (Reissue)</h2><p>This classic continues to inspire new generations. The 2024 special edition features restored content and new commentary from literary scholars.</p><h2>2. Perahu Kertas by Dee Lestari (Special Edition)</h2><p>Dee Lestari returns with a special edition that includes never-before-published chapters. Kugy and Keenan\'s story continues to capture hearts.</p><h2>3. Filosofi Teras by Henry Manampiring</h2><p>Henry Manampiring successfully makes Stoic philosophy accessible through this novel. Originally considered niche, the book has become a phenomenon among young readers.</p><h2>4. Laut Bercerita by Leila S. Chudori</h2><p>Leila S. Chudori presents a powerful novel about activists who disappeared during the New Order era. A must-read work to understand Indonesian history.</p><h2>5. Hujan by Tere Liye</h2><p>Tere Liye returns with an emotional novel. Hujan tells of friendship and love amidst life\'s difficulties.</p>',
      category: 'Rekomendasi',
      categoryEn: 'Recommendations',
      image: 'https://picsum.photos/seed/blog-indonesia-novels/800/400',
      author: 'Alya Putri',
    },
    {
      title: 'Panduan Memilih Genre Novel yang Tepat untuk Anda',
      titleEn: 'How to Choose the Right Novel Genre for You',
      slug: 'panduan-memilih-genre-novel',
      excerpt: 'Bingung memilih genre novel? Panduan lengkap ini akan membantu Anda menemukan genre yang paling sesuai dengan selera membaca Anda.',
      excerptEn: 'Struggling to choose a novel genre? This comprehensive guide will help you find the genre that best matches your reading taste.',
      content: '<h2>Menemukan Genre yang Tepat</h2><p>Memilih genre novel yang tepat bisa menjadi tantangan. Fantasy cocok untuk Anda yang suka dunia imajinatif. Romance untuk pencinta kisah cinta. Thriller bagi yang menikmati ketegangan.</p><h2>Memahami Preferensi Anda</h2><p>Tanyakan pada diri sendiri: Apakah Anda lebih suka aksi cepat atau pengembangan karakter yang mendalam? Jawabannya akan membimbing Anda ke genre ideal.</p><h2>Perpaduan Genre</h2><p>Jangan takut mengeksplorasi novel dengan perpaduan genre. Banyak karya kontemporer terbaik menggabungkan elemen dari berbagai genre.</p><h2>Membangun Daftar Baca</h2><p>Mulailah dari bestseller di genre yang Anda minati, lalu secara bertahap eksplorasi genre terkait.</p>',
      contentEn: '<h2>Finding Your Perfect Genre</h2><p>Choosing the right novel genre can be a challenge. Fantasy is perfect for those who love imaginative worlds. Romance for lovers of love stories. Thriller for those who enjoy tension.</p><h2>Understanding Your Preferences</h2><p>Ask yourself: Do you prefer fast-paced action or slow-burn character development? The answers will guide you to your ideal genre.</p><h2>Genre Blending</h2><p>Don\'t be afraid to explore genre-blending novels. Many of the best contemporary works combine elements from multiple genres.</p><h2>Building Your Reading List</h2><p>Start with bestsellers in your preferred genre, then gradually explore related genres.</p>',
      category: 'Panduan',
      categoryEn: 'Guide',
      image: 'https://picsum.photos/seed/blog-genre-guide/800/400',
      author: 'Rizki Mahendra',
    },
    {
      title: 'Tips Membangun Kebiasaan Membaca yang Konsisten',
      titleEn: 'Tips for Building a Consistent Reading Habit',
      slug: 'tips-kebiasaan-membaca',
      excerpt: 'Ingin rajin membaca tapi sulit konsisten? Berikut tips praktis untuk membangun kebiasaan membaca.',
      excerptEn: 'Want to read more but struggling to stay consistent? Here are practical tips for building a lasting reading habit.',
      content: '<h2>Mulai dari yang Kecil</h2><p>Membangun kebiasaan membaca membutuhkan waktu dan konsistensi. Mulai dari yang kecil, targetkan 10-15 menit per hari.</p><h2>Ciptakan Lingkungan Membaca</h2><p>Siapkan sudut baca yang nyaman di rumah Anda. Minimalkan gangguan dengan menjauhkan ponsel. Pencahayaan yang baik membuat perbedaan besar.</p><h2>Bergabung dengan Komunitas</h2><p>Klub buku dan komunitas membaca online memberikan akuntabilitas dan motivasi. Berbagi pemikiran tentang buku meningkatkan pengalaman membaca.</p><h2>Lacak Progres Anda</h2><p>Gunakan jurnal membaca atau aplikasi seperti Goodreads untuk melacak pembacaan Anda.</p>',
      contentEn: '<h2>Start Small, Stay Consistent</h2><p>Building a reading habit takes time and consistency. Start small, target 10-15 minutes per day.</p><h2>Create a Reading Environment</h2><p>Designate a cozy reading corner in your home. Minimize distractions by keeping your phone in another room.</p><h2>Join a Reading Community</h2><p>Book clubs and online reading communities provide accountability and motivation.</p><h2>Track Your Progress</h2><p>Use a reading journal or apps like Goodreads to track your reading.</p>',
      category: 'Tips',
      categoryEn: 'Tips',
      image: 'https://picsum.photos/seed/blog-reading-habit/800/400',
      author: 'Nadia Safira',
    },
    {
      title: 'Sejarah Novel Indonesia dari Masa ke Masa',
      titleEn: 'The History of Indonesian Novels Through the Ages',
      slug: 'sejarah-novel-indonesia',
      excerpt: 'Perjalanan panjang novel Indonesia dari era kolonial hingga modern, mencerminkan perubahan sosial dan budaya bangsa.',
      excerptEn: 'The long journey of Indonesian novels from the colonial era to modern times, reflecting the nation\'s social and cultural changes.',
      content: '<h2>Era Kolonial</h2><p>Novel Indonesia bermula dari era kolonial Belanda. Karya-karya awal seperti Siti Nurbaya karya Marah Roesli (1922) menjadi tonggak awal sastra Indonesia modern.</p><h2>Era Kemerdekaan</h2><p>Pasca-kemerdekaan, novel Indonesia mengalami transformasi signifikan. Pramoedya Ananta Toer muncul sebagai salah satu penulis paling berpengaruh.</p><h2>Era Reformasi</h2><p>Era reformasi membuka ruang kebebasan berkreasi yang lebih luas. Novel-novel mulai membahas topik-topik yang sebelumnya tabu.</p><h2>Era Digital</h2><p>Saat ini, novel Indonesia terus berkembang dengan penulis muda yang kreatif dan inovatif.</p>',
      contentEn: '<h2>The Colonial Era</h2><p>Indonesian novels originated during the Dutch colonial era. Early works like Siti Nurbaya by Marah Roesli (1922) became the cornerstone of modern Indonesian literature.</p><h2>The Independence Era</h2><p>Post-independence, Indonesian novels underwent significant transformation. Pramoedya Ananta Toer emerged as one of the most influential writers.</p><h2>The Reform Era</h2><p>The reform era opened wider creative freedom. Novels began addressing previously taboo topics.</p><h2>The Digital Era</h2><p>Today, Indonesian novels continue to evolve with creative and innovative young writers.</p>',
      category: 'Sejarah',
      categoryEn: 'History',
      image: 'https://picsum.photos/seed/blog-history-novel/800/400',
      author: 'Prof. Hendra Wijaya',
    },
    {
      title: 'Review: 5 Novel Terbaru yang Sedang Viral',
      titleEn: 'Review: 5 Viral Novels Everyone\'s Talking About',
      slug: 'review-5-novel-viral',
      excerpt: 'Lima novel terbaru yang sedang dibicarakan banyak pembaca. Simak review lengkapnya di sini.',
      excerptEn: 'Five new novels that everyone is buzzing about. Read our complete reviews here.',
      content: '<h2>1. Ronggeng Dukuh Paruk</h2><p>Novel karya Ahmad Tohari ini kembali populer berkat adaptasi filmnya. Menceritakan kehidupan Srintil sebagai ronggeng di desa terpencil Jawa Tengah.</p><h2>2. Perahu Kertas</h2><p>Dee Lestari kembali dengan sekuel yang dinantikan penggemar. Kisah cinta Kugy dan Keenan yang rumit namun indah.</p><h2>3. Filosofi Teras</h2><p>Henry Manampiring berhasil membuat filosofi Stoikisme mudah dipahami. Buku yang awalnya niche kini menjadi fenomena.</p><h2>4. Laut Bercerita</h2><p>Leila S. Chudori menghadirkan novel yang powerful tentang aktivis yang hilang selama era Orde Baru.</p><h2>5. Hujan</h2><p>Tere Liye kembali dengan novel yang penuh emosi tentang persahabatan dan cinta.</p>',
      contentEn: '<h2>1. Ronggeng Dukuh Paruk</h2><p>This novel by Ahmad Tohari has regained popularity thanks to its film adaptation. It tells the life of Srintil as a ronggeng dancer in a remote Central Javanese village.</p><h2>2. Perahu Kertas</h2><p>Dee Lestari returns with a sequel fans have been waiting for. The complicated yet beautiful love story of Kugy and Keenan.</p><h2>3. Filosofi Teras</h2><p>Henry Manampiring successfully makes Stoic philosophy easy to understand. A book originally considered niche has become a phenomenon.</p><h2>4. Laut Bercerita</h2><p>Leila S. Chudori presents a powerful novel about activists who disappeared during the New Order era.</p><h2>5. Hujan</h2><p>Tere Liye returns with an emotional novel about friendship and love.</p>',
      category: 'Review',
      categoryEn: 'Review',
      image: 'https://picsum.photos/seed/blog-viral-novels/800/400',
      author: 'Dian Permata',
    },
    {
      title: 'Bagaimana Novel Membentuk Empati dan Kecerdasan Emosional',
      titleEn: 'How Novels Shape Empathy and Emotional Intelligence',
      slug: 'novel-dan-empati',
      excerpt: 'Penelitian ilmiah membuktikan bahwa membaca novel dapat meningkatkan empati dan kecerdasan emosional.',
      excerptEn: 'Scientific research proves that reading novels can enhance empathy and emotional intelligence.',
      content: '<h2>Ilmu di Balik Membaca</h2><p>Penelitian yang dipublikasikan dalam jurnal Science menunjukkan bahwa membaca fiksi sastra dapat meningkatkan kemampuan seseorang dalam membaca emosi.</p><h2>Novel vs Non-Fiksi</h2><p>Studi menemukan bahwa pembaca fiksi menunjukkan skor yang lebih tinggi dalam tes empati dibandingkan pembaca non-fiksi.</p><h2>Neurosains Membaca</h2><p>Scanner otak menunjukkan bahwa saat kita membaca tentang pengalaman karakter, otak kita mengaktifkan area yang sama.</p><h2>Manfaat Praktis</h2><p>Meningkatnya empati melalui membaca memiliki dampak nyata: hubungan interpersonal yang lebih baik dan pemahaman yang lebih dalam tentang isu-isu sosial.</p>',
      contentEn: '<h2>The Science Behind Reading</h2><p>Research published in the journal Science shows that reading literary fiction can enhance a person\'s ability to read emotions and understand others\' perspectives.</p><h2>Novels vs Non-Fiction</h2><p>Studies found that fiction readers show higher scores in empathy tests compared to non-fiction readers.</p><h2>The Neuroscience of Reading</h2><p>Brain scanners show that when we read about a character\'s experiences, our brain activates the same areas.</p><h2>Practical Benefits</h2><p>Increased empathy through reading has real-world impact: better interpersonal relationships and a deeper understanding of social issues.</p>',
      category: 'Edukasi',
      categoryEn: 'Education',
      image: 'https://picsum.photos/seed/blog-empathy-reading/800/400',
      author: 'Dr. Sari Indah',
    },
  ];

  for (const blog of blogs) {
    await db.blog.create({ data: blog });
    console.log(`Created: ${blog.slug} ✓`);
  }

  console.log('\nAll blog posts created with English translations!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
