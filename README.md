# Yemekhane Rezervasyon Sistemi

Yemekhane Rezervasyon Sistemi, kurumsal yemekhaneler için geliştirilmiş tam yığınlı bir rezervasyon ve ödeme takip uygulamasıdır. Sistem; aylık yemek rezervasyonlarını, günlük ödeme takibini, tatil günü yönetimini ve tatil ilan edilen günler için otomatik iade kaydı oluşturmayı destekler.

Proje, Java 17 ve Spring Boot tabanlı bir backend ile React + Vite tabanlı bir frontend mimarisi üzerine kuruludur.

---

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [İş Mantığı](#iş-mantığı)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Varsayılan Kullanıcılar](#varsayılan-kullanıcılar)
- [Kullanım Senaryosu](#kullanım-senaryosu)
- [Geliştirme Notları](#geliştirme-notları)
- [Lisans](#lisans)

---

## Genel Bakış

Bu uygulama, yemekhane rezervasyon süreçlerini dijitalleştirmek ve ödeme/iade takibini daha düzenli hâle getirmek amacıyla geliştirilmiştir.

Kurumlarda yemek rezervasyonu genellikle manuel formlar, Excel tabloları veya dağınık iletişim kanalları üzerinden takip edilir. Bu durum; yanlış rezervasyon sayıları, ödeme takibinde belirsizlik ve tatil günlerinde manuel iade hesaplama gibi operasyonel sorunlara yol açabilir.

Yemekhane Rezervasyon Sistemi, bu süreci merkezi bir uygulama üzerinden yöneterek hem kullanıcılar hem de yöneticiler için daha izlenebilir ve kontrollü bir yapı sunar.

---

## Özellikler

### Kullanıcı Paneli

Kullanıcılar sistem üzerinden aylık yemek rezervasyonlarını gün bazında yönetebilir. Rezervasyon yapılan günler için ödeme durumu takip edilebilir; tatil ilan edilen günlerde ise ilgili iade kayıtları görüntülenebilir.

Temel kullanıcı işlemleri:

- Aylık rezervasyonları görüntüleme
- Gün bazlı yemek rezervasyonu oluşturma
- Rezervasyon durumunu takip etme
- Ödeme bilgilerini görüntüleme
- İade kayıtlarını takip etme

### Admin Paneli

Admin kullanıcıları, yemekhane operasyonlarını merkezi olarak yönetebilir. Menü yönetimi, tatil günü tanımlama ve rezervasyon kontrolü admin paneli üzerinden yapılır.

Temel admin işlemleri:

- Menü yönetimi
- Tatil günü yönetimi
- Rezervasyon kayıtlarını görüntüleme
- Kullanıcı rezervasyonlarını izleme
- Tatil ilan edilen günler için otomatik iade sürecini yönetme

---

## İş Mantığı

Sistem, aylık yemek rezervasyonu mantığı üzerine kuruludur. Kullanıcılar belirli günler için yemek rezervasyonu yapar ve her rezervasyon günü için ödeme takibi oluşturulur.

README kapsamında ödeme tutarı günlük **100 TL** olarak belirtilmiştir. Kullanıcı bir gün için rezervasyon oluşturduğunda, sistem bu gün için ödeme takibini de ilişkilendirir.

Bir gün daha sonradan tatil veya kapalı gün olarak işaretlenirse, sistem o güne ait rezervasyonları kontrol eder ve ilgili kullanıcılar için otomatik iade kaydı oluşturur.

Bu yapı sayesinde:

- Günlük yemek sayısı daha sağlıklı tahmin edilir.
- Ödeme ve rezervasyon ilişkisi daha açık hâle gelir.
- Tatil günleri için manuel iade hesaplama ihtiyacı azalır.
- Kullanıcı ve admin tarafında daha şeffaf bir takip mekanizması oluşur.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | Java 17, Spring Boot |
| API | Spring Web |
| Veri Erişimi | Spring Data JPA |
| Doğrulama | Spring Validation |
| Veritabanı | H2 Database |
| Frontend | React, Vite |
| HTTP İstekleri | Axios |
| Routing | React Router DOM |
| İkonlar | Lucide React |
| Backend Build Aracı | Maven |
| Frontend Paket Yöneticisi | npm |

---

## Mimari

Proje klasik istemci-sunucu mimarisiyle geliştirilmiştir.

Frontend tarafında React + Vite kullanılarak tek sayfa uygulama yapısı oluşturulmuştur. Kullanıcı arayüzü, backend tarafından sağlanan REST API uç noktaları ile haberleşir.

Backend tarafında Spring Boot kullanılmıştır. REST API katmanı, iş mantığı ve veri erişim katmanı backend içerisinde yönetilir. Spring Data JPA ile veritabanı işlemleri gerçekleştirilir.

Varsayılan geliştirme ortamında H2 Database kullanılmaktadır. Bu yapı, projeyi hızlı şekilde çalıştırmak ve test etmek için uygundur. Üretim ortamı için PostgreSQL veya MySQL gibi kalıcı bir veritabanı tercih edilmesi daha doğru olacaktır.

---

## Proje Yapısı

```text
reservation-system-for-the-canteen/
├── backend/        # Spring Boot backend servisi
├── frontend/       # React + Vite frontend uygulaması
├── seed.js         # Başlangıç verisi / seed işlemleri için script
├── README.md       # Proje dokümantasyonu
└── .gitignore
```

### Backend

```text
backend/
├── src/            # Java kaynak kodları
├── pom.xml         # Maven bağımlılıkları ve proje yapılandırması
└── maven.zip       # Proje ile birlikte gelen Maven dağıtımı
```

### Frontend

```text
frontend/
├── src/            # React kaynak kodları
├── package.json    # Frontend bağımlılıkları ve script'ler
└── vite.config.*   # Vite yapılandırması
```

---

## Kurulum ve Çalıştırma

### Gereksinimler

Projeyi çalıştırmak için aşağıdaki araçların sisteminizde kurulu olması önerilir:

- Java 17
- Node.js
- npm
- Maven

> Not: Proje içerisinde `backend/maven.zip` bulunduğu için Maven dağıtımı repo ile birlikte de kullanılabilir.

---

### Backend'i Çalıştırma

Backend servisi varsayılan olarak `http://localhost:8080` adresinde çalışır.

```bash
cd backend
mvn spring-boot:run
```

Eğer sisteminizde Maven kurulu değilse ve projedeki Maven dağıtımını kullanmak istiyorsanız, önce `backend/maven.zip` dosyasını çıkarmanız gerekir.

Ardından Maven binary yolu üzerinden çalıştırabilirsiniz:

```bash
cd backend
./maven/apache-maven-3.9.6/bin/mvn spring-boot:run
```

Windows için örnek kullanım:

```bash
cd backend
maven\apache-maven-3.9.6\bin\mvn spring-boot:run
```

---

### Frontend'i Çalıştırma

Frontend uygulaması varsayılan olarak `http://localhost:5173` adresinde çalışır.

```bash
cd frontend
npm install
npm run dev
```

Tarayıcı üzerinden aşağıdaki adrese giderek uygulamayı açabilirsiniz:

```text
http://localhost:5173
```

---

## Varsayılan Kullanıcılar

Projede test ve geliştirme amacıyla kullanılabilecek varsayılan kullanıcılar bulunmaktadır.

| E-posta | Şifre | Rol |
|---|---:|---|
| admin@yemekhane.com | 123456 | Admin |
| kullanici@yemekhane.com | 123456 | Kullanıcı |
| ahmet@yemekhane.com | 123456 | Kullanıcı |

Admin kullanıcısı yönetim paneline erişebilir. Kullanıcı rolündeki hesaplar ise rezervasyon, ödeme ve iade takip ekranlarını kullanabilir.

---

## Kullanım Senaryosu

Bir kurum çalışanı, ay içerisindeki yemek yiyeceği günleri sistem üzerinden seçer. Sistem bu rezervasyonları gün bazında kaydeder ve ilgili ödeme durumunu takip eder.

Örneğin kullanıcı, ayın belirli günleri için yemek rezervasyonu oluşturduğunda sistem bu günleri kullanıcının hesabıyla ilişkilendirir. Her gün için günlük ücret üzerinden ödeme takibi yapılır.

Admin tarafında ise kurum yemekhanesi için tatil veya kapalı günler tanımlanabilir. Daha önce rezervasyon yapılmış bir gün tatil olarak işaretlenirse, sistem ilgili gün için otomatik iade kaydı üretir.

Bu sayede rezervasyon, ödeme ve iade süreçleri tek bir sistem üzerinden yönetilebilir.

---

## Örnek İş Akışı

1. Kullanıcı sisteme giriş yapar.
2. Aylık rezervasyon ekranından yemek yiyeceği günleri seçer.
3. Sistem seçilen günler için rezervasyon kaydı oluşturur.
4. Her rezervasyon günü için ödeme takibi yapılır.
5. Admin panelinden bir gün tatil olarak işaretlenirse sistem ilgili rezervasyonları kontrol eder.
6. Tatil gününe ait rezervasyonu bulunan kullanıcılar için otomatik iade kaydı oluşturulur.
7. Kullanıcı iade durumunu kendi panelinden görüntüleyebilir.

---

## Geliştirme Notları

Bu proje, kurumsal yemekhane operasyonlarında sık görülen üç temel problemi çözmeyi hedefler:

1. Gün bazlı yemek rezervasyonlarının düzenli tutulması
2. Ödeme ve iade süreçlerinin izlenebilir hâle getirilmesi
3. Tatil veya kapalı gün değişikliklerinin rezervasyon sistemine otomatik yansıtılması

Mevcut yapı geliştirmeye açıktır. Özellikle authentication, authorization, raporlama ve kalıcı veritabanı tarafında iyileştirmeler yapılabilir.

---

## Geliştirilebilecek Özellikler

İlerleyen sürümlerde aşağıdaki özellikler eklenebilir:

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme iyileştirmeleri
- PostgreSQL veya MySQL entegrasyonu
- Docker ve Docker Compose desteği
- Excel çıktısı alma
- PDF rapor oluşturma
- Gelişmiş admin raporlama ekranı
- Günlük, haftalık ve aylık rezervasyon istatistikleri
- Kullanıcı bazlı ödeme geçmişi
- Bildirim sistemi
- E-posta ile rezervasyon/iade bildirimi
- Mobil uyum iyileştirmeleri
- API dokümantasyonu için Swagger/OpenAPI entegrasyonu

---

## Üretim Ortamı İçin Öneriler

Bu proje geliştirme ve test ortamında H2 veritabanı ile kolayca çalıştırılabilir. Ancak üretim ortamında aşağıdaki düzenlemelerin yapılması önerilir:

- H2 yerine PostgreSQL veya MySQL kullanılmalıdır.
- Varsayılan kullanıcı şifreleri değiştirilmelidir.
- Kimlik doğrulama JWT veya session tabanlı güvenli bir yapıya taşınmalıdır.
- CORS ayarları sadece izin verilen frontend domainleriyle sınırlandırılmalıdır.
- Hassas bilgiler environment variable üzerinden yönetilmelidir.
- Backend ve frontend için ayrı build/deploy süreçleri oluşturulmalıdır.
- Loglama ve hata izleme mekanizmaları eklenmelidir.

---

## API

Backend REST API yapısı Spring Boot üzerinde çalışmaktadır. API uç noktaları backend kaynak kodunda controller sınıfları üzerinden incelenebilir.

İlerleyen sürümlerde Swagger/OpenAPI desteği eklenerek API dokümantasyonu otomatik üretilebilir.

Önerilen API dokümantasyon geliştirmesi:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

Bu entegrasyon sonrasında API dokümantasyonu genellikle aşağıdaki adresten erişilebilir:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## Frontend Komutları

Frontend dizininde kullanılabilecek temel komutlar:

```bash
npm install
```

Bağımlılıkları yükler.

```bash
npm run dev
```

Geliştirme sunucusunu başlatır.

```bash
npm run build
```

Production build oluşturur.

```bash
npm run preview
```

Oluşturulan production build'i yerel ortamda önizler.

```bash
npm run lint
```

Kod kalitesi ve lint kontrollerini çalıştırır.

---

## Backend Komutları

Backend dizininde kullanılabilecek temel komutlar:

```bash
mvn spring-boot:run
```

Spring Boot uygulamasını başlatır.

```bash
mvn clean install
```

Projeyi temizler, bağımlılıkları indirir ve build işlemini gerçekleştirir.

```bash
mvn test
```

Testleri çalıştırır.

---

## Katkı Sağlama

Projeye katkı sağlamak için aşağıdaki adımlar izlenebilir:

1. Repoyu fork'layın.
2. Yeni bir branch oluşturun.
3. Değişikliklerinizi yapın.
4. Gerekli testleri çalıştırın.
5. Pull request oluşturun.

Örnek branch isimlendirmesi:

```text
feature/reservation-report
fix/payment-refund-bug
docs/update-readme
```

---

## Lisans

Bu proje için henüz bir lisans bilgisi belirtilmemiştir.

Lisans eklemek isterseniz `LICENSE` dosyası oluşturabilir ve README içerisinde lisans türünü belirtebilirsiniz.
