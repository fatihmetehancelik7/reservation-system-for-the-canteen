# ─── Yemekhane Veri Doldurma Scripti ───────────────────────────────────────────
# Kullanım: powershell -ExecutionPolicy Bypass -File seed_data.ps1
# ────────────────────────────────────────────────────────────────────────────────

$baseUrl = "http://localhost:8080/api"

# 1. Admin token al
$loginBody = '{"email":"admin@yemekhane.com","sifre":"123456"}'
$auth = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $auth.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "[OK] Admin girisi yapildi"

# ─── 2. Yeni kullanicilari ekle ─────────────────────────────────────────────────
$newUsers = @(
    @{ ad="Ayse";    soyad="Kaya";    email="ayse@yemekhane.com";    sifre="123456"; rol="KULLANICI" },
    @{ ad="Mehmet";  soyad="Demir";   email="mehmet@yemekhane.com";  sifre="123456"; rol="KULLANICI" },
    @{ ad="Zeynep";  soyad="Celik";   email="zeynep@yemekhane.com";  sifre="123456"; rol="KULLANICI" },
    @{ ad="Mustafa"; soyad="Ozturk";  email="mustafa@yemekhane.com"; sifre="123456"; rol="KULLANICI" }
)

foreach ($u in $newUsers) {
    try {
        $body = $u | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/users/register" -Method POST -Body $body -ContentType "application/json" -Headers $headers | Out-Null
        Write-Host "[OK] Kullanici eklendi: $($u.email)"
    } catch {
        Write-Host "[--] $($u.email) zaten mevcut veya hata"
    }
}

# ─── 3. Resmi tatilleri ekle ─────────────────────────────────────────────────────
$holidays = @(
    @{ tarih="2026-04-23"; aciklama="Ulusal Egemenlik ve Cocuk Bayrami" },
    @{ tarih="2026-05-01"; aciklama="Emek ve Dayanisma Gunu" },
    @{ tarih="2026-05-19"; aciklama="Ataturku Anma, Genclik ve Spor Bayrami" },
    @{ tarih="2026-03-20"; aciklama="Ramazan Bayrami 1. Gun" },
    @{ tarih="2026-03-21"; aciklama="Ramazan Bayrami 2. Gun" },
    @{ tarih="2026-03-22"; aciklama="Ramazan Bayrami 3. Gun" },
    @{ tarih="2026-05-27"; aciklama="Kurban Bayrami 1. Gun" },
    @{ tarih="2026-05-28"; aciklama="Kurban Bayrami 2. Gun" },
    @{ tarih="2026-05-29"; aciklama="Kurban Bayrami 3. Gun" },
    @{ tarih="2026-05-30"; aciklama="Kurban Bayrami 4. Gun" },
    @{ tarih="2026-07-15"; aciklama="Demokrasi ve Milli Birlik Gunu" },
    @{ tarih="2026-08-30"; aciklama="Zafer Bayrami" },
    @{ tarih="2026-10-29"; aciklama="Cumhuriyet Bayrami" }
)

foreach ($h in $holidays) {
    try {
        $body = $h | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/holidays" -Method POST -Body $body -ContentType "application/json" -Headers $headers | Out-Null
        Write-Host "[OK] Tatil eklendi: $($h.tarih) - $($h.aciklama)"
    } catch {
        Write-Host "[--] $($h.tarih) zaten mevcut"
    }
}

# ─── 4. Yemek listesi ─────────────────────────────────────────────────────────────
$menuler = @(
    "Mercimek Corbasi, Tavuk Sote, Pirinc Pilavi, Mevsim Salatasi",
    "Domates Corbasi, Kofte, Makarna, Cacik",
    "Tarhana Corbasi, Etli Guvec, Bulgur Pilavi, Tursu",
    "Ezogelin Corbasi, Patlican Musakka, Pirinc Pilavi, Yogurt",
    "Yayla Corbasi, Tavuk Izgara, Patates Puresi, Salata",
    "Mercimek Corbasi, Dana Rosto, Bulgur Pilavi, Mevsim Salatasi",
    "Sehriye Corbasi, Karniyarik, Pirinc Pilavi, Ayran",
    "Tarhana Corbasi, Tavuk Sis, Bulgur Pilavi, Cacik",
    "Domates Corbasi, Etli Nohut, Pirinc Pilavi, Salata",
    "Mercimek Corbasi, Firin Tavuk, Makarna, Yogurt",
    "Ezogelin Corbasi, Izmir Kofte, Pirinc Pilavi, Tursu",
    "Yayla Corbasi, Patlican Kebabi, Bulgur Pilavi, Salata",
    "Sehriye Corbasi, Coban Kavurma, Pirinc Pilavi, Cacik",
    "Tarhana Corbasi, Tavuk Haslama, Patates, Mevsim Salatasi",
    "Domates Corbasi, Etli Lahana, Pirinc Pilavi, Ayran",
    "Mercimek Corbasi, Patlican Musakka, Bulgur Pilavi, Yogurt",
    "Ezogelin Corbasi, Kofte Sote, Pirinc Pilavi, Salata",
    "Yayla Corbasi, Firin Et, Makarna, Cacik",
    "Tarhana Corbasi, Tavuk Tandir, Pirinc Pilavi, Tursu",
    "Sehriye Corbasi, Etli Bakla, Bulgur Pilavi, Mevsim Salatasi",
    "Domates Corbasi, Mantar Sote, Pirinc Pilavi, Salata",
    "Mercimek Corbasi, Ispanak Yemegi, Bulgur Pilavi, Yogurt"
)

# Haziran, Temmuz, Agustos
$aylar = @(6, 7, 8)
$menuIdx = 0
$toplam = 0
$hata = 0

foreach ($ay in $aylar) {
    $ayGunSayisi = [DateTime]::DaysInMonth(2026, $ay)
    for ($gun = 1; $gun -le $ayGunSayisi; $gun++) {
        $tarih = [DateTime]::new(2026, $ay, $gun)
        $gunAdi = $tarih.DayOfWeek
        if ($gunAdi -ne 'Saturday' -and $gunAdi -ne 'Sunday') {
            $tarihStr = "2026-{0:D2}-{1:D2}" -f $ay, $gun
            $yemek = $menuler[$menuIdx % $menuler.Length]
            $body = '{"tarih":"' + $tarihStr + '","yemekListesi":"' + $yemek + '"}'
            try {
                Invoke-RestMethod -Uri "$baseUrl/menus" -Method POST -Body $body -ContentType "application/json" -Headers $headers | Out-Null
                Write-Host "[OK] Menu: $tarihStr"
                $toplam++
            } catch {
                Write-Host "[--] $tarihStr zaten mevcut veya tatil"
                $hata++
            }
            $menuIdx++
        }
    }
}

Write-Host ""
Write-Host "=== TAMAMLANDI ==="
Write-Host "Menu eklendi    : $toplam gun"
Write-Host "Atlanan         : $hata gun"
