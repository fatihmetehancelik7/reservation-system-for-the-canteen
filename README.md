# Yemekhane Rezervasyon Sistemi

Yemekhane Rezervasyon Sistemi, kurumsal yemekhaneler için geliştirilmiş tam yığınlı bir rezervasyon ve ödeme takip uygulamasıdır. Sistem; aylık yemek rezervasyonlarını, günlük ödeme takibini, tatil günü yönetimini ve tatil ilan edilen günler için otomatik iade kaydı oluşturmayı destekler.

Proje, Java 17 ve Spring Boot tabanlı bir backend ile React + Vite tabanlı bir frontend mimarisi üzerine kuruludur.

---

## Özellikler

### Kullanıcı Paneli

Kullanıcılar sistem üzerinden aylık yemek rezervasyonlarını gün bazında yönetebilir. Rezervasyon yapılan günler için ödeme durumu takip edilebilir; tatil ilan edilen günlerde ise ilgili iade kayıtları görüntülenebilir.

Temel kullanıcı işlemleri:

- Aylık ve günlük rezervasyon görüntüleme
- Gün bazlı yemek rezervasyonu oluşturma
- Ödeme durumunu takip etme
- İade kayıtlarını görüntüleme

### Admin Paneli

Admin kullanıcıları, yemekhane operasyonlarını merkezi olarak yönetebilir. Menü yönetimi, tatil günü tanımlama ve rezervasyon kontrolü admin paneli üzerinden yapılır.

Temel admin işlemleri:

- Menü yönetimi
- Tatil günü yönetimi
- Rezervasyon kayıtlarını izleme
- Tatil ilan edilen günler için otomatik iade sürecini yönetme

---

## İş Mantığı

Sistem, aylık yemek rezervasyonu mantığı üzerine kuruludur. Kullanıcılar belirli günler için yemek rezervasyonu yapar ve her rezervasyon günü için ödeme takibi oluşturulur.

README’de ödeme tutarı günlük **100 TL** olarak belirtilmiştir. Bir gün sonradan tatil olarak işaretlenirse, sistem o güne ait rezervasyonlar için otomatik iade kaydı oluşturur. Bu yapı, manuel takip yükünü azaltır ve ödeme/iade süreçlerinin daha izlenebilir olmasını sağlar.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | Java 17, Spring Boot 3 |
| API | Spring Web |
| Veri Erişimi | Spring Data JPA |
| Doğrulama | Spring Validation |
| Veritabanı | H2 Database |
| Frontend | React 18, Vite |
| UI / İkonlar | Lucide React |
| HTTP Client | Axios |
| Routing | React Router DOM |
| Build Aracı | Maven, npm |

---

## Proje Yapısı

```text
reservation-system-for-the-canteen/
├── backend/        # Spring Boot backend servisi
├── frontend/       # React + Vite frontend uygulaması
├── seed.js         # Başlangıç verisi / seed işlemleri için script
├── README.md       # Proje dokümantasyonu
└── .gitignore
