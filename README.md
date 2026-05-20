# Yemekhane Rezervasyon Sistemi 🍽️

Kurumsal yemekhane için aylık rezervasyon ve ödeme takip sistemi.

## Özellikler

- 📅 Aylık gün bazlı rezervasyon
- 💳 Toplu ödeme (100 TL/gün)
- 🗓️ Tatil günü yönetimi
- 💸 Otomatik iade kaydı (tatil ilan edildiğinde)
- 👨‍💼 Admin paneli (menü, tatil, rezervasyon yönetimi)
- 👤 Kullanıcı paneli (rezervasyon, ödeme, iade takibi)

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 3, Spring Data JPA |
| Veritabanı | H2 (in-memory) |
| Frontend | React 18, Vite, Lucide Icons |
| Build | Apache Maven 3.9.6 |

## Kurulum

### Backend

```bash
cd backend
./maven/apache-maven-3.9.6/bin/mvn spring-boot:run
```

> Sunucu: http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Uygulama: http://localhost:5173

## Varsayılan Kullanıcılar

| E-posta | Şifre | Rol |
|---------|-------|-----|
| admin@yemekhane.com | 123456 | Admin |
| kullanici@yemekhane.com | 123456 | Kullanıcı |
| ahmet@yemekhane.com | 123456 | Kullanıcı |
