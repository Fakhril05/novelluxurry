import { db } from '../src/lib/db';

async function main() {
  const users = await db.user.findMany();
  const books = await db.book.findMany();
  if (users.length === 0 || books.length === 0) {
    console.log('No users or books found. Run main seed first.');
    return;
  }

  const reviews = [
    { userId: users[0].id, bookId: books[0].id, rating: 5, comment: 'Absolutely stunning! The world-building is incredible and the characters feel so real. A must-read for fantasy lovers.' },
    { userId: users[1].id, bookId: books[0].id, rating: 5, comment: 'One of the best fantasy novels I have ever read. The prose is beautiful and the story is gripping from start to finish.' },
    { userId: users[0].id, bookId: books[1].id, rating: 4, comment: 'A magical journey through the Fae realm. The ending left me wanting more!' },
    { userId: users[1].id, bookId: books[2].id, rating: 5, comment: 'Epic dragon battles and a compelling hero. Could not put it down.' },
    { userId: users[0].id, bookId: books[3].id, rating: 5, comment: 'A love letter to Paris and to second chances. Beautifully written.' },
    { userId: users[1].id, bookId: books[4].id, rating: 4, comment: 'Heartwarming story about books and new beginnings. Perfect for a cozy weekend.' },
    { userId: users[0].id, bookId: books[5].id, rating: 5, comment: 'Cherry blossom season in Kyoto has never been more romantic. A masterpiece.' },
    { userId: users[1].id, bookId: books[6].id, rating: 5, comment: 'Kept me up all night! The twist ending was completely unexpected.' },
    { userId: users[0].id, bookId: books[7].id, rating: 4, comment: 'A thrilling tech-thriller that feels too real. Highly recommended.' },
    { userId: users[1].id, bookId: books[8].id, rating: 5, comment: 'Legal thriller at its finest. Maya Torres is a protagonist you will root for.' },
    { userId: users[0].id, bookId: books[9].id, rating: 5, comment: 'Mind-bending sci-fi that makes you question reality itself.' },
    { userId: users[1].id, bookId: books[12].id, rating: 5, comment: 'A literary masterpiece spanning three generations of women.' },
    { userId: users[0].id, bookId: books[14].id, rating: 5, comment: 'My daughter loved this! A magical library adventure for all ages.' },
    { userId: users[1].id, bookId: books[16].id, rating: 4, comment: 'Rich historical detail and a compelling merchant tale.' },
    { userId: users[0].id, bookId: books[18].id, rating: 5, comment: 'Genuinely creepy. Edgar Graves is the modern master of horror.' },
  ];

  for (const r of reviews) {
    await db.review.create({ data: r });
  }
  console.log(`Created ${reviews.length} reviews ✓`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
