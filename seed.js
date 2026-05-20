const yemekListeleri = [
  "Mercimek Çorbası, Tavuk Sote, Pilav, Ayran",
  "Ezogelin Çorbası, Orman Kebabı, Makarna, Salata",
  "Tarhana Çorbası, İzmir Köfte, Bulgur Pilavı, Cacık",
  "Domates Çorbası, Fırın Tavuk, Patates Püresi, Meyve",
  "Yayla Çorbası, Etli Nohut, Pirinç Pilavı, Turşu",
  "Mantar Çorbası, Karnıyarık, Pirinç Pilavı, Cacık",
  "Sebze Çorbası, Izgara Köfte, Patates Kızartması, Salata"
];

async function seed() {
  const aylar = [6, 7]; // Haziran ve Temmuz 2026
  let eklendi = 0;

  for (let ay of aylar) {
    // 1'den 31'e kadar dönüyoruz
    for (let gun = 1; gun <= 31; gun++) {
      try {
        const date = new Date(2026, ay - 1, gun);
        
        // Geçersiz günleri atla (örn: Haziran 31)
        if (date.getMonth() !== ay - 1) continue;
        
        const dayOfWeek = date.getDay();
        // Hafta sonu atla (0 = Pazar, 6 = Cumartesi)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const dateStr = `${2026}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
        const randomMenu = yemekListeleri[Math.floor(Math.random() * yemekListeleri.length)];
        
        const res = await fetch('http://localhost:8080/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tarih: dateStr,
            yemekListesi: randomMenu
          })
        });

        if (res.ok) {
          eklendi++;
          console.log(`${dateStr} menüsü eklendi.`);
        } else {
          const err = await res.json();
          console.log(`${dateStr} menüsü eklenemedi: `, err.error);
        }
      } catch (e) {
        console.log(`Hata oluştu: ${e.message}`);
      }
    }
  }
  console.log(`Toplam ${eklendi} adet menü eklendi.`);
}

seed();
