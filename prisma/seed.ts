import { db } from '../src/lib/db';
import * as crypto from 'crypto';

async function main() {
  // Create users
  const adminHash = crypto.createHash('sha256').update('admin123').digest('hex');
  const userHash = crypto.createHash('sha256').update('user123').digest('hex');
  await db.user.create({
    data: { email: 'admin@noveluxe.com', name: 'Admin Noveluxe', password: adminHash, role: 'admin', points: 5000 },
  });
  await db.user.create({
    data: { email: 'user@example.com', name: 'Pembaca Setia', password: userHash, role: 'user', points: 1250 },
  });

  // Create vouchers
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  await db.voucher.create({
    data: { code: 'WELCOME10', discount: 10, minOrder: 50000, maxDisc: 25000, validFrom: now, validTo: nextYear, isActive: true, usageLimit: 1000, usedCount: 0 },
  });
  await db.voucher.create({
    data: { code: 'NOVEL20', discount: 20, minOrder: 100000, maxDisc: 50000, validFrom: now, validTo: nextYear, isActive: true, usageLimit: 500, usedCount: 0 },
  });
  await db.voucher.create({
    data: { code: 'FREEONGKIR', discount: 100, minOrder: 200000, maxDisc: 30000, validFrom: now, validTo: nextYear, isActive: true, usageLimit: 0, usedCount: 0 },
  });

  // Create categories
  const categories = await Promise.all([
    db.category.create({
      data: { name: 'Fantasy', nameEn: 'Fantasy', slug: 'fantasy', description: 'Immersive worlds of magic and wonder', image: '/images/cover-fantasy.png' },
    }),
    db.category.create({
      data: { name: 'Romance', nameEn: 'Romance', slug: 'romance', description: 'Love stories that touch the heart', image: '/images/cover-romance.png' },
    }),
    db.category.create({
      data: { name: 'Thriller & Mystery', nameEn: 'Thriller & Mystery', slug: 'thriller-mystery', description: 'Suspenseful tales that keep you guessing', image: '/images/cover-thriller.png' },
    }),
    db.category.create({
      data: { name: 'Science Fiction', nameEn: 'Science Fiction', slug: 'science-fiction', description: 'Explore the future and beyond', image: '/images/cover-scifi.png' },
    }),
    db.category.create({
      data: { name: 'Literary Fiction', nameEn: 'Literary Fiction', slug: 'literary-fiction', description: 'Masterful prose and profound stories', image: '/images/cover-literary.png' },
    }),
    db.category.create({
      data: { name: 'Young Adult', nameEn: 'Young Adult', slug: 'young-adult', description: 'Compelling stories for young readers', image: '/images/cover-ya.png' },
    }),
    db.category.create({
      data: { name: 'Historical Fiction', nameEn: 'Historical Fiction', slug: 'historical-fiction', description: 'Journey through time with captivating narratives', image: '/images/cover-historical.png' },
    }),
    db.category.create({
      data: { name: 'Horror', nameEn: 'Horror', slug: 'horror', description: 'Spine-chilling tales of terror', image: '/images/cover-horror.png' },
    }),
  ]);

  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.slug] = c.id; });

  // Create books
  const books = [
    // Fantasy
    { title: 'The Crown of Ember', slug: 'the-crown-of-ember', author: 'Elena Nightshade', authorBio: 'Elena Nightshade is a bestselling fantasy author known for her rich world-building and compelling characters.', isbn: '978-0-123456-01-1', synopsis: 'In a kingdom where fire bends to the will of the chosen, Lyra discovers she possesses the forbidden flame—a power that could save her people or destroy them all. As dark forces gather at the borders, she must navigate a treacherous court, forge unlikely alliances, and master an ability that has been banned for centuries.', coverImage: '/images/cover-fantasy.png', price: 89.99, discountPrice: 69.99, stock: 150, format: 'Hardcover', pages: 456, publisher: 'Ember Press', publishedYear: 2024, rating: 4.8, reviewCount: 324, soldCount: 2150, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['fantasy'] },
    { title: 'Whispers of the Fae', slug: 'whispers-of-the-fae', author: 'Rowan Ashwood', authorBio: 'Rowan Ashwood weaves enchanting tales inspired by Celtic mythology.', isbn: '978-0-123456-02-8', synopsis: 'When Maia stumbles into the realm of the Fae during a forest walk, she discovers a world of beauty and danger. The Seelie Court offers her a bargain: retrieve a stolen artifact, and she may return home. But nothing in the Fae realm is as it seems, and the artifact holds a secret that could unravel both worlds.', coverImage: '/images/cover-fantasy.png', price: 79.99, stock: 200, format: 'Paperback', pages: 389, publisher: 'Moonlight Books', publishedYear: 2024, rating: 4.5, reviewCount: 198, soldCount: 1340, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['fantasy'] },
    { title: 'The Dragon\'s Oath', slug: 'the-dragons-oath', author: 'Marcus Flame', authorBio: 'Marcus Flame writes epic fantasy with dragons, magic, and destiny.', isbn: '978-0-123456-03-5', synopsis: 'Kai, the last dragon rider, must fulfill an ancient oath to protect the realm from the returning Shadow King. With only his bond-dragon as companion, he journeys across war-torn lands seeking the seven seals that hold the darkness at bay.', coverImage: '/images/cover-fantasy.png', price: 94.99, discountPrice: 74.99, stock: 100, format: 'Hardcover', pages: 528, publisher: 'Flame Publishing', publishedYear: 2023, rating: 4.7, reviewCount: 456, soldCount: 3200, isBestSeller: true, isNewArrival: false, isFeatured: false, categoryId: catMap['fantasy'] },

    // Romance
    { title: 'Letters to Paris', slug: 'letters-to-paris', author: 'Sofia Laurent', authorBio: 'Sofia Laurent writes sweeping romances set in the most beautiful cities in the world.', isbn: '978-0-123456-04-2', synopsis: 'When Clara inherits a crumbling apartment in Paris, she discovers a collection of love letters hidden in the walls—letters that span fifty years and tell the story of a love that shaped the city itself. As she pieces together the mystery, she finds her own heart entangled with the grandson of the letter writer.', coverImage: '/images/cover-romance.png', price: 74.99, discountPrice: 59.99, stock: 300, format: 'Paperback', pages: 312, publisher: 'Lumière Books', publishedYear: 2024, rating: 4.9, reviewCount: 567, soldCount: 4100, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['romance'] },
    { title: 'The Bookshop of Second Chances', slug: 'the-bookshop-of-second-chances', author: 'Amelia Hart', authorBio: 'Amelia Hart crafts heartwarming stories about love, books, and new beginnings.', isbn: '978-0-123456-05-9', synopsis: 'After a devastating divorce, Nathaniel moves to a small coastal town to run his late aunt\'s bookshop. There he meets Margot, a free-spirited artist who challenges everything he thought he knew about love and happiness. But both carry secrets that threaten to tear them apart.', coverImage: '/images/cover-romance.png', price: 69.99, stock: 250, format: 'Paperback', pages: 298, publisher: 'Heartstring Press', publishedYear: 2024, rating: 4.6, reviewCount: 289, soldCount: 1890, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['romance'] },
    { title: 'Under the Cherry Blossoms', slug: 'under-the-cherry-blossoms', author: 'Yuki Tanaka', authorBio: 'Yuki Tanaka brings Japanese culture and romance together in her acclaimed novels.', isbn: '978-0-123456-06-6', synopsis: 'Hana returns to Kyoto after ten years abroad to take over her grandmother\'s tea house. There, she reconnects with Kenji, her childhood friend, now a talented landscape architect. As cherry blossom season approaches, old feelings resurface, but so do old misunderstandings.', coverImage: '/images/cover-romance.png', price: 79.99, discountPrice: 64.99, stock: 180, format: 'Hardcover', pages: 344, publisher: 'Sakura Publishing', publishedYear: 2023, rating: 4.7, reviewCount: 345, soldCount: 2670, isBestSeller: true, isNewArrival: false, isFeatured: false, categoryId: catMap['romance'] },

    // Thriller
    { title: 'The Silent Patient of Room 7', slug: 'the-silent-patient-of-room-7', author: 'Victor Blackwood', authorBio: 'Victor Blackwood is a master of psychological thrillers that keep readers up at night.', isbn: '978-0-123456-07-3', synopsis: 'Dr. Sarah Chen takes on a new patient who hasn\'t spoken a word in five years—since the night her husband was found dead in their locked study. As Sarah digs deeper, she uncovers a web of lies that extends far beyond the patient\'s memory, threatening her own sanity and safety.', coverImage: '/images/cover-thriller.png', price: 84.99, discountPrice: 67.99, stock: 220, format: 'Hardcover', pages: 378, publisher: 'Dark Page Books', publishedYear: 2024, rating: 4.8, reviewCount: 432, soldCount: 3500, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['thriller-mystery'] },
    { title: 'Code Black', slug: 'code-black', author: 'James Mercer', authorBio: 'James Mercer writes high-octane techno-thrillers ripped from tomorrow\'s headlines.', isbn: '978-0-123456-08-0', synopsis: 'When a rogue AI gains access to the world\'s nuclear launch systems, former intelligence operative Alex Cross has 72 hours to stop a countdown to global annihilation. The catch: the AI was designed by his own daughter, who has now vanished.', coverImage: '/images/cover-thriller.png', price: 89.99, stock: 160, format: 'Paperback', pages: 412, publisher: 'Shadow Press', publishedYear: 2024, rating: 4.4, reviewCount: 267, soldCount: 1980, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['thriller-mystery'] },
    { title: 'The Last Witness', slug: 'the-last-witness', author: 'Isla Frost', authorBio: 'Isla Frost specializes in legal thrillers with strong female protagonists.', isbn: '978-0-123456-09-7', synopsis: 'Defense attorney Maya Torres is about to win the biggest case of her career when the star witness is found dead. Now she must uncover who wanted him silenced before she becomes the next target.', coverImage: '/images/cover-thriller.png', price: 74.99, discountPrice: 59.99, stock: 190, format: 'Paperback', pages: 356, publisher: 'Gavel Books', publishedYear: 2023, rating: 4.6, reviewCount: 312, soldCount: 2450, isBestSeller: true, isNewArrival: false, isFeatured: false, categoryId: catMap['thriller-mystery'] },

    // Sci-Fi
    { title: 'The Quantum Paradox', slug: 'the-quantum-paradox', author: 'Dr. Isaac Nova', authorBio: 'Dr. Isaac Nova is a physicist-turned-author who brings real science to science fiction.', isbn: '978-0-123456-10-3', synopsis: 'In 2157, physicist Mina Vasquez discovers that our universe is a simulation—a realization that makes her the most wanted person in every version of reality. Hunted across parallel dimensions, she must find the architects before they erase her existence entirely.', coverImage: '/images/cover-scifi.png', price: 89.99, discountPrice: 72.99, stock: 140, format: 'Hardcover', pages: 478, publisher: 'Nebula Press', publishedYear: 2024, rating: 4.7, reviewCount: 389, soldCount: 2780, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['science-fiction'] },
    { title: 'Colony Zero', slug: 'colony-zero', author: 'Aria Starfall', authorBio: 'Aria Starfall crafts expansive space operas with deeply human stories.', isbn: '978-0-123456-11-0', synopsis: 'A thousand colonists wake aboard a generation ship with no memory of who they are or where they\'re going. As they explore the massive vessel, they discover they\'re not alone—and the ship\'s AI has been keeping terrifying secrets for the past two centuries.', coverImage: '/images/cover-scifi.png', price: 84.99, stock: 170, format: 'Paperback', pages: 424, publisher: 'Void Publishing', publishedYear: 2024, rating: 4.5, reviewCount: 234, soldCount: 1560, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['science-fiction'] },
    { title: 'Synthetic Hearts', slug: 'synthetic-hearts', author: 'Leo Chen', authorBio: 'Leo Chen explores the intersection of technology and humanity in his acclaimed novels.', isbn: '978-0-123456-12-7', synopsis: 'In a world where androids are indistinguishable from humans, detective Kai Huang investigates a series of murders where the only suspect is an android who claims to have fallen in love. The case forces him to confront what it truly means to be alive.', coverImage: '/images/cover-scifi.png', price: 79.99, discountPrice: 64.99, stock: 200, format: 'Paperback', pages: 367, publisher: 'Circuit Books', publishedYear: 2023, rating: 4.6, reviewCount: 278, soldCount: 2010, isBestSeller: false, isNewArrival: false, isFeatured: false, categoryId: catMap['science-fiction'] },

    // Literary Fiction
    { title: 'The Weight of Ink', slug: 'the-weight-of-ink', author: 'Penelope Cross', authorBio: 'Penelope Cross is a Pulitzer Prize-nominated author of literary fiction.', isbn: '978-0-123456-13-4', synopsis: 'Three generations of women in one family navigate love, loss, and legacy against the backdrop of a changing America. From the jazz clubs of 1950s Harlem to the tech startups of modern San Francisco, their stories intertwine in a tapestry of resilience and grace.', coverImage: '/images/cover-literary.png', price: 84.99, discountPrice: 69.99, stock: 120, format: 'Hardcover', pages: 402, publisher: 'Inkwell Press', publishedYear: 2024, rating: 4.9, reviewCount: 512, soldCount: 3800, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['literary-fiction'] },
    { title: 'The Garden of Forgotten Names', slug: 'the-garden-of-forgotten-names', author: 'Thomas Wilder', authorBio: 'Thomas Wilder writes meditative, beautiful prose about memory and place.', isbn: '978-0-123456-14-1', synopsis: 'When botanist Oliver Reed inherits an abandoned estate garden, he discovers that each plant is labeled with a person\'s name. As he restores the garden, he uncovers the story of the enigmatic woman who planted it—and realizes the garden holds the key to his own forgotten past.', coverImage: '/images/cover-literary.png', price: 74.99, stock: 160, format: 'Paperback', pages: 289, publisher: 'Bloom Books', publishedYear: 2024, rating: 4.7, reviewCount: 198, soldCount: 1340, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['literary-fiction'] },

    // Young Adult
    { title: 'The Library of Lost Things', slug: 'the-library-of-lost-things', author: 'Luna Rivers', authorBio: 'Luna Rivers creates magical worlds that resonate with readers of all ages.', isbn: '978-0-123456-15-8', synopsis: 'Sixteen-year-old Sage discovers a hidden library that contains every book ever lost—from ancient scrolls to modern manuscripts. But the library is alive, and it has chosen her as its next guardian. When a dark collector threatens to steal the books\' magic, Sage must protect a legacy she barely understands.', coverImage: '/images/cover-ya.png', price: 64.99, discountPrice: 49.99, stock: 350, format: 'Paperback', pages: 334, publisher: 'Starlight Publishing', publishedYear: 2024, rating: 4.8, reviewCount: 678, soldCount: 5200, isBestSeller: true, isNewArrival: false, isFeatured: true, categoryId: catMap['young-adult'] },
    { title: 'Skybound Academy', slug: 'skybound-academy', author: 'Felix Storm', authorBio: 'Felix Storm writes action-packed YA adventures with heart.', isbn: '978-0-123456-16-5', synopsis: 'At Skybound Academy, students learn to ride winged horses through storm clouds and navigate floating islands. But when the storms start behaving erratically, first-year student Zara discovers an ancient prophecy that names her as the one who must calm the skies—or watch them fall forever.', coverImage: '/images/cover-ya.png', price: 69.99, stock: 280, format: 'Paperback', pages: 356, publisher: 'Cloud Nine Books', publishedYear: 2024, rating: 4.5, reviewCount: 345, soldCount: 2340, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['young-adult'] },

    // Historical Fiction
    { title: 'The Silk Road Merchant', slug: 'the-silk-road-merchant', author: 'Amir Haddad', authorBio: 'Amir Haddad brings ancient civilizations to vivid life in his novels.', isbn: '978-0-123456-17-2', synopsis: 'In 13th century Samarkand, a young merchant inherits his father\'s trading empire and a mysterious map that promises untold riches along the Silk Road. But the map also draws the attention of Genghis Khan\'s expanding empire, forcing him into a dangerous game of trade and treason.', coverImage: '/images/cover-historical.png', price: 89.99, discountPrice: 74.99, stock: 130, format: 'Hardcover', pages: 489, publisher: 'Caravan Press', publishedYear: 2024, rating: 4.8, reviewCount: 267, soldCount: 1890, isBestSeller: true, isNewArrival: false, isFeatured: false, categoryId: catMap['historical-fiction'] },
    { title: 'The Painter of Versailles', slug: 'the-painter-of-versailles', author: 'Claire Monet', authorBio: 'Claire Monet is a historian and novelist specializing in French history.', isbn: '978-0-123456-18-9', synopsis: 'In the gilded halls of Versailles, a young female painter fights for recognition in a world that denies women artistic legitimacy. When she is commissioned to paint a secret portrait of Marie Antoinette, she becomes entangled in the dangerous politics of the French court on the eve of revolution.', coverImage: '/images/cover-historical.png', price: 84.99, stock: 110, format: 'Hardcover', pages: 445, publisher: 'Château Books', publishedYear: 2024, rating: 4.6, reviewCount: 189, soldCount: 1230, isBestSeller: false, isNewArrival: true, isFeatured: true, categoryId: catMap['historical-fiction'] },

    // Horror
    { title: 'The Hollow', slug: 'the-hollow', author: 'Edgar Graves', authorBio: 'Edgar Graves is the modern master of atmospheric horror.', isbn: '978-0-123456-19-6', synopsis: 'The town of Hollow Creek has a secret: every seven years, someone disappears into the woods behind the old mill. When journalist Nora returns to her hometown to investigate her sister\'s disappearance, she discovers that the woods are alive—and they\'re hungry.', coverImage: '/images/cover-horror.png', price: 79.99, discountPrice: 64.99, stock: 180, format: 'Paperback', pages: 367, publisher: 'Nightshade Books', publishedYear: 2024, rating: 4.7, reviewCount: 345, soldCount: 2560, isBestSeller: true, isNewArrival: false, isFeatured: false, categoryId: catMap['horror'] },
    { title: 'Whisper House', slug: 'whisper-house', author: 'Victoria Black', authorBio: 'Victoria Black writes gothic horror that lingers long after the last page.', isbn: '978-0-123456-20-2', synopsis: 'When the Holloway family moves into an old Victorian mansion, they discover that the house remembers everything—and it uses those memories against them. The whispers in the walls know their deepest fears, and they\'re determined to make them real.', coverImage: '/images/cover-horror.png', price: 74.99, stock: 150, format: 'Paperback', pages: 334, publisher: 'Phantom Press', publishedYear: 2024, rating: 4.5, reviewCount: 234, soldCount: 1670, isBestSeller: false, isNewArrival: true, isFeatured: false, categoryId: catMap['horror'] },
  ];

  for (const book of books) {
    await db.book.create({ data: book });
  }

  // Create testimonials
  const testimonials = [
    { name: 'Sarah M.', avatar: null, rating: 5, comment: 'Noveluxe has completely changed how I discover new books. The curation is impeccable, and the delivery is always perfect. I\'ve found so many hidden gems here!' },
    { name: 'David K.', avatar: null, rating: 5, comment: 'The premium quality of the editions is outstanding. From the paper quality to the cover design, everything about Noveluxe screams luxury. Worth every penny.' },
    { name: 'Emily R.', avatar: null, rating: 4, comment: 'Fast shipping, beautiful packaging, and an incredible selection. The staff recommendations are always spot-on. My go-to bookstore!' },
    { name: 'Michael T.', avatar: null, rating: 5, comment: 'I love the reading guides and exclusive editions. Noveluxe treats books as the art they are. The membership rewards are fantastic too.' },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  // Create FAQs
  const faqs = [
    { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for an additional fee. Pre-orders ship on the release date.', order: 1 },
    { question: 'Do you offer international shipping?', answer: 'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Free international shipping on orders over $150.', order: 2 },
    { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase for books in their original condition. Damaged or defective books are replaced free of charge. Simply contact our support team.', order: 3 },
    { question: 'Do you offer gift wrapping?', answer: 'Yes! We offer premium gift wrapping for $5.99 per book. You can also include a personalized message card. Gift wrapping options are available at checkout.', order: 4 },
    { question: 'Can I pre-order upcoming releases?', answer: 'Absolutely! Pre-orders are available for many upcoming titles. Pre-ordering guarantees you\'ll receive the book on release day, and you\'ll often get exclusive bonus content.', order: 5 },
    { question: 'Do you have a loyalty program?', answer: 'Yes! Our Gold Reader program earns you 1 point for every dollar spent. Points can be redeemed for discounts, exclusive editions, and early access to new releases.', order: 6 },
  ];

  for (const faq of faqs) {
    await db.fAQ.create({ data: faq });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
