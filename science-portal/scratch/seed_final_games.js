const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding The Final 3 Games...");

  const moduleId = 3; // Kehidupan di Bumi

  // 1. Truth or Myth
  await prisma.material.create({
    data: {
      title: "Mitos atau Fakta: Hewan Nokturnal",
      content: "Uji pengetahuanmu! Geser ke kanan jika FAKTA, ke kiri jika MITOS.",
      type: "game",
      order: 13,
      moduleId: moduleId,
      game_type: "truth_or_myth",
      game_data: {
        truth_or_myth: [
          { statement: "Kelelawar sebenarnya buta dan hanya bergantung pada suara.", isTruth: false },
          { statement: "Burung hantu dapat memutar kepalanya hingga 270 derajat.", isTruth: true },
          { statement: "Kucing bisa melihat dalam kegelapan total tanpa cahaya sama sekali.", isTruth: false },
          { statement: "Kunang-kunang menghasilkan cahaya untuk menarik pasangannya.", isTruth: true },
          { statement: "Banteng akan marah jika melihat warna merah.", isTruth: false }
        ]
      }
    }
  });

  // 2. Science Wordle
  await prisma.material.create({
    data: {
      title: "Tebak Kata Misteri (Wordle)",
      content: "Pecahkan kode sains 5 huruf ini dalam 6 kali percobaan!",
      type: "game",
      order: 14,
      moduleId: moduleId,
      game_type: "science_wordle",
      game_data: {
        science_wordle: {
          word: "FOSIL",
          clue: "Sisa-sisa makhluk hidup masa lalu yang membatu."
        }
      }
    }
  });

  // 3. Catch the Basket
  await prisma.material.create({
    data: {
      title: "Tangkap Herbivora!",
      content: "Geser keranjang ke kiri dan kanan untuk menangkap hewan pemakan tumbuhan.",
      type: "game",
      order: 15,
      moduleId: moduleId,
      game_type: "catch_basket",
      game_data: {
        catch_basket: {
          targetCategory: "Hewan Herbivora",
          items: [
            { text: "Sapi", isTarget: true },
            { text: "Kambing", isTarget: true },
            { text: "Singa", isTarget: false },
            { text: "Kuda", isTarget: true },
            { text: "Harimau", isTarget: false },
            { text: "Jerapah", isTarget: true },
            { text: "Buaya", isTarget: false },
            { text: "Gajah", isTarget: true }
          ]
        }
      }
    }
  });

  console.log("Success! Games 13, 14, 15 added to Module 3.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
