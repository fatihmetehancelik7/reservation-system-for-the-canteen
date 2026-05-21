# 🍽️ Yemekhane Rezervasyon Sistemi

Kurumsal yemekhaneler için geliştirilmiş tam yığınlı (full-stack) bir rezervasyon, ödeme ve yönetim uygulamasıdır.

Sistem; aylık yemek rezervasyonlarını, çoklu ay ödeme toplamlarını, tatil günü yönetimini, otomatik iade kayıtlarını, kullanıcı yönetimini ve yönetici istatistik panelini tek bir platformda sunar.

> **Canlı Repo:** [github.com/fatihmetehancelik7/reservation-system-for-the-canteen](https://github.com/fatihmetehancelik7/reservation-system-for-the-canteen)

---

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Varsayılan Kullanıcılar](#varsayılan-kullanıcılar)
- [API Uç Noktaları](#api-uç-noktaları)
- [İş Mantığı](#iş-mantığı)
- [Geliştirme Notları](#geliştirme-notları)

---

## Genel Bakış

Yemekhane Rezervasyon Sistemi, kurum çalışanlarının aylık yemek rezervasyonlarını dijital ortamda yönetmesini sağlar. Kullanıcılar istedikleri günleri takvimden seçerek rezervasyon oluşturabilir; birden fazla ay için seçim yapıp tek seferde ödeme yapabilir. Yöneticiler menü planlama, tatil günü yönetimi, istatistik takibi ve kullanıcı yönetimi işlemlerini merkezi admin panelinden gerçekleştirir.

---

## Özellikler

### 👤 Kullanıcı Paneli

| Özellik | Açıklama |
|---------|----------|
| **Aylık Rezervasyon** | Takvimden hafta içi günleri seçerek rezervasyon oluşturma |
| **Çoklu Ay Seçimi** | Haziran, Temmuz, Ağustos gibi birden fazla ay seçilip tek butonla ödeme yapılabilir |
| **Toplam Tutar Görünümü** | Tüm seçili ayların genel toplamı ve ay ay döküm paneli |
| **Rezervasyon Güncelleme** | Mevcut rezervasyona gün eklenip çıkarılabilir, fark tutarı gösterilir |
| **Geçmiş Gün Kilitleme** | Bugün ve önceki günler takvimde kilitli gösterilir, seçilemez |
| **İade Takibi** | Tatil ilan edilen günlerdeki iade kayıtları kullanıcı panelinde görüntülenir |
| **Ödeme Geçmişi** | Tüm rezervasyon ve ödeme kayıtları liste hâlinde takip edilebilir |

### 🛠️ Admin Paneli

| Özellik | Açıklama |
|---------|----------|
| **Menü Yönetimi** | Günlük yemek listelerini tarih bazlı ekleme, düzenleme, silme |
| **Tatil Günü Yönetimi** | Tatil ilan edilen günlerde otomatik iade kaydı oluşturulur |
| **Rezervasyon Kayıtları** | Tüm kullanıcıların rezervasyonlarını listeleme ve filtreleme |
| **Kullanıcı Yönetimi** | Yeni kullanıcı ekleme (modal form), rol atama, arama ve filtreleme |
| **İstatistikler / Raporlama** | Aylık gelir, rezervasyon sayısı, aktif kullanıcı ve iade toplamları gibi operasyonel metrikler |

---

## Ekran Görüntüleri

> Uygulamayı çalıştırarak aşağıdaki adresleri ziyaret edebilirsiniz:
>
> - **Kullanıcı Paneli:** `http://localhost:5173`
> - **Admin Paneli:** `http://localhost:5173/admin/menu`

---

## Teknoloji Yığını

### Backend

| Teknoloji | Sürüm | Kullanım |
|-----------|-------|----------|
| Java | 17 | Temel dil |
| Spring Boot | 3.2.3 | Uygulama çatısı |
| Spring Web | — | REST API katmanı |
| Spring Data JPA | — | Veri erişim katmanı |
| Spring Validation | — | İstek doğrulama |
| H2 Database | — | Kalıcı dosya tabanlı veritabanı (`file:./data/yemekhane_db`) |
| Lombok | — | Boilerplate azaltma |
| Maven | 3.9.6 | Build aracı |

### Frontend

| Teknoloji | Kullanım |
|-----------|----------|
| React 18 | UI kütüphanesi |
| Vite | Build aracı ve geliştirme sunucusu |
| React Router DOM | Sayfa yönlendirme |
| TanStack Query (React Query) | Sunucu durumu yönetimi |
| Axios | HTTP istekleri |
| Lucide React | İkon kütüphanesi |
| Vanilla CSS | Özel stil sistemi |

---

## Proje Yapısı

```text
reservation-system-for-the-canteen/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/yemekhane/
│   │   ├── config/
│   │   │   └── DataInitializer.java  # Başlangıç verisi (kullanıcılar, tatiller)
│   │   ├── controller/               # REST controller'lar
│   │   ├── dto/                      # Veri transfer nesneleri
│   │   ├── entity/                   # JPA entity sınıfları
│   │   ├── exception/                # Hata yönetimi
│   │   ├── repository/               # Spring Data JPA repository'leri
│   │   └── service/                  # İş mantığı servisleri
│   ├── src/main/resources/
│   │   └── application.yml           # Uygulama yapılandırması
│   ├── data/                         # H2 veritabanı dosyaları (gitignore'da)
│   ├── pom.xml
│   └── maven/                        # Paketlenmiş Maven dağıtımı
│
├── frontend/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/               # Tekrar kullanılabilir UI bileşenleri
│   │   ├── context/                  # Auth context
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MonthlySelection.jsx  # Rezervasyon ve ödeme
│   │   │   ├── MyReservations.jsx
│   │   │   ├── AdminMenu.jsx
│   │   │   ├── AdminHolidays.jsx
│   │   │   ├── AdminReservations.jsx
│   │   │   ├── AdminStatistics.jsx   # İstatistik paneli
│   │   │   └── AdminUsers.jsx        # Kullanıcı yönetimi
│   │   ├── services/                 # API servis fonksiyonları
│   │   └── App.jsx                   # Routing tanımları
│   └── package.json
│
├── seed_data.ps1                     # Toplu veri yükleme scripti (PowerShell)
├── README.md
└── .gitignore
```

---

## Kurulum ve Çalıştırma

### Gereksinimler

- Java 17+
- Node.js 18+
- npm

> Maven sisteminizde kurulu olmasa bile `backend/maven/` klasöründeki dağıtım kullanılabilir.

---

### 1. Backend'i Başlatma

```bash
cd backend
```

**Sistem Maven'ı ile:**
```bash
mvn spring-boot:run
```

**Proje içindeki Maven ile (Windows):**
```powershell
.\maven\apache-maven-3.9.6\bin\mvn spring-boot:run
```

Backend `http://localhost:8080` adresinde çalışır.  
H2 konsolu: `http://localhost:8080/h2-console`

> Veritabanı dosyası `backend/data/yemekhane_db.mv.db` olarak saklanır ve uygulama yeniden başlatıldığında veriler korunur.

---

### 2. Frontend'i Başlatma

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

---

### 3. Başlangıç Verilerini Yükleme (İsteğe Bağlı)

Haziran–Temmuz–Ağustos menüleri ile ek kullanıcıları yüklemek için backend çalışırken:

```powershell
powershell -ExecutionPolicy Bypass -File .\seed_data.ps1
```

---

## Varsayılan Kullanıcılar

Uygulama ilk çalıştırıldığında aşağıdaki kullanıcılar otomatik oluşturulur:

| Ad Soyad | E-posta | Şifre | Rol |
|----------|---------|-------|-----|
| Admin Sistem | admin@yemekhane.com | 123456 | Admin |
| Standart Kullanıcı | kullanici@yemekhane.com | 123456 | Kullanıcı |
| Ahmet Yılmaz | ahmet@yemekhane.com | 123456 | Kullanıcı |

`seed_data.ps1` çalıştırıldığında ek olarak eklenen kullanıcılar:

| Ad Soyad | E-posta | Şifre | Rol |
|----------|---------|-------|-----|
| Ayşe Kaya | ayse@yemekhane.com | 123456 | Kullanıcı |
| Mehmet Demir | mehmet@yemekhane.com | 123456 | Kullanıcı |
| Zeynep Çelik | zeynep@yemekhane.com | 123456 | Kullanıcı |
| Mustafa Öztürk | mustafa@yemekhane.com | 123456 | Kullanıcı |

---

## API Uç Noktaları

Tüm API uç noktaları `http://localhost:8080/api` altında tanımlıdır.

### Kullanıcılar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/users/login` | Giriş işlemi |
| `GET` | `/users` | Tüm kullanıcıları listele |
| `POST` | `/users` | Yeni kullanıcı oluştur |

### Menüler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/menus?yil=&ay=` | Aya ait menüleri getir |
| `POST` | `/menus` | Yeni menü ekle |
| `PUT` | `/menus/{id}` | Menü güncelle |
| `DELETE` | `/menus/{id}` | Menü sil |

### Rezervasyonlar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/reservations` | Tüm rezervasyonlar |
| `GET` | `/reservations/user/{userId}` | Kullanıcıya ait rezervasyonlar |
| `POST` | `/reservations` | Rezervasyon oluştur |
| `PUT` | `/reservations/{id}` | Rezervasyon güncelle |

### Tatil Günleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/holidays` | Tatil günlerini listele |
| `POST` | `/holidays` | Tatil günü ekle |
| `DELETE` | `/holidays/{id}` | Tatil günü sil |

### İstatistikler (Admin)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/stats/overview` | Genel istatistikler |
| `GET` | `/stats/monthly-revenue` | Aylık gelir grafiği |
| `GET` | `/stats/top-users` | En aktif kullanıcılar |

---

## İş Mantığı

### Rezervasyon Kuralları

- Günlük yemek ücreti **100 TL** sabittir.
- Yalnızca **hafta içi** günler seçilebilir (Cumartesi-Pazar kapalı).
- **Bugün ve önceki günler** için rezervasyon oluşturulamaz / değiştirilemez (kilitli).
- Menü tanımlanmamış günler takvimde pasif görünür.
- Tatil ilan edilen günler kırmızı olarak işaretlenir.

### Çoklu Ay Ödeme

- Kullanıcı farklı aylara geçerek seçim yapabilir.
- Ödeme paneli tüm ayların **genel toplamını** anlık olarak gösterir.
- **"Tümünü Öde"** butonu, bekleyen tüm yeni ay rezervasyonlarını sırayla API'ye gönderir.
- Mevcut bir rezervasyonu olan ay için ayrı **"Güncelle"** butonu görünür.

### Tatil ve İade

- Admin bir günü tatil ilan ettiğinde, o gün için rezervasyon yapan tüm kullanıcılara otomatik iade kaydı oluşturulur.
- İade kayıtları kullanıcı panelinde ve admin "Tüm Ödemeler" ekranında görünür.

---

## Geliştirme Notları

### Veritabanı Yapılandırması

Veritabanı `backend/src/main/resources/application.yml` içinde tanımlıdır:

```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/yemekhane_db;AUTO_SERVER=TRUE
```

`AUTO_SERVER=TRUE` ile aynı anda birden fazla bağlantıya izin verilir (H2 konsolu + uygulama).

Veritabanı dosyaları `.gitignore` ile versiyon kontrolü dışında tutulur:

```
backend/data/
```

### Proje İçi Maven Kullanımı

`backend/maven/` klasöründe Apache Maven 3.9.6 dağıtımı bulunur. Sisteme Maven kurulum gerekmeden doğrudan kullanılabilir.

---

## Üretim Ortamı İçin Öneriler

| Alan | Öneri |
|------|-------|
| Veritabanı | H2 yerine PostgreSQL veya MySQL kullanılmalıdır |
| Kimlik Doğrulama | JWT tabanlı güvenli auth mekanizması eklenmeli |
| Şifreler | Üretimde BCrypt ile hashlenmelidir |
| CORS | Yalnızca izin verilen domainler tanımlanmalıdır |
| Yapılandırma | Hassas bilgiler environment variable ile yönetilmeli |
| Build | Backend ve frontend için CI/CD pipeline kurulmalıdır |

---

## Lisans

Bu proje için henüz bir lisans belirlenmemiştir.
