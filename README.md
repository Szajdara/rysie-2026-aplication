# 🏆 Rysie 2026 – Oficjalna Aplikacja Liczenia Głosów

Dedykowany, bezpieczny panel do sprawnego zliczania głosów w szkolnym plebiscycie nauczycielskim **„Rysie 2026”**.  
Aplikacja została zaprojektowana pod kątem **wygodnej pracy na smartfonach** oraz komputerach członków komisji skrutacyjnej, z gotowością do natychmiastowego wdrożenia na **Vercel**.

---

## ✨ Kluczowe funkcje

- 🔒 **Dostęp „pod klucz” na hasło**:
  - Panel jest zabezpieczony ekranem logowania. Tylko uprawnione osoby znające hasło mogą przeglądać i edytować wyniki.
  - Domyślne dane: **Login:** `organizator` | **Hasło:** `rysie2026` (można zmienić w zmiennych środowiskowych).
- 🎬 **6 Oficjalnych Kategorii Plebiscytu**:
  1. **Forrest Gump** – *„Biegnij Forrest!” (energia, dobre serce, pomocna dłoń)*
  2. **Terminator** – *„I’ll be back” (żelazne zasady, dyscyplina, konsekwencja)*
  3. **Sherlock Holmes** – *„Elementarne, drogi Watsonie” (spostrzegawczość, wyłapywanie ściąg)*
  4. **Darth Vader / Anakin Skywalker** – *„Nie lekceważ potęgi Mocy” (autorytet, charyzma)*
  5. **Gandalf** – *„Nie przejdziesz!” (mądrość, wyrozumiałość, magia nauczania)*
  6. **Vito Corleone** – *„Propozycja nie do odrzucenia” (klasa, szacunek, posłuch)*
- 🥇 **Automatyczne i natychmiastowe wyróżnienia kolorystyczne**:
  - **ZŁOTY KOLOR (Złoty Ryś 🥇)** – lider kategorii (1. miejsce).
  - **SREBRNY KOLOR (Srebrni Nominowani 🥈🥉)** – dwaj nauczyciele na 2. i 3. miejscu.
  - Pełna obsługa remisów (*ex aequo*).
- 📱 **Zoptymalizowany interfejs na telefony**:
  - Duże, wygodne przyciski `+` i `-` (min. 44px) z wibracjami dotykowymi (haptic feedback).
  - Szybki skrót `+5` do pakietowego dodawania głosów.
  - Pasek szybkiego skoku do dowolnej kategorii na małych ekranach.
  - Autouzupełnianie nazwisk – jeśli nauczyciel został wpisany w jednej kategorii, w kolejnych pojawia się jako podpowiedź jednym kliknięciem.
- ↩️ **Funkcja „Cofnij” (Undo)**:
  - Błyskawiczne cofnięcie pomyłkowego kliknięcia `+` lub `-`.
- 🎭 **Interaktywny Tryb Gali (Prezentacja)**:
  - Gotowy do wyświetlenia na rzutniku podczas apelu/gali!
  - Prezentacja 2 Srebrnych Nominowanych, po czym spektakularne kliknięcie **„ODKRYJ ZWYCIĘZCĘ RYSIE 2026!”** z deszczem konfetti 🎉 i złotym pucharem 🏆.
- 📄 **Oficjalny Protokół A4 (PDF / Druk)**:
  - Gotowy do wydruku dokument podsumowujący z tabelą wyników i miejscami na podpisy członków komisji skrutacyjnej.
- 💾 **Kopia zapasowa i Eksport**:
  - Pobieranie danych do pliku JSON i możliwość przywrócenia na innym urządzeniu.
  - Eksport do pliku `.csv` zgodnego z Microsoft Excel / Google Sheets (z polskimi znakami UTF-8 BOM).
  - Bezpieczny reset bazy chroniony hasłem `RESET`.

---

## 🚀 Jak wdrożyć aplikację na Vercel (1-kliknięciem)

Aplikacja jest w 100% kompatybilna z darmowym hostingiem **Vercel**:

### Krok 1: Wypchnięcie kodu na GitHub
1. Załóż nowe repozytorium na [GitHub](https://github.com/new) (np. `rysie-2026`).
2. W folderze projektu wykonaj polecenia:
   ```bash
   git add .
   git commit -m "Wdrożenie panelu Rysie 2026"
   git remote add origin https://github.com/TWOJA_NAZWA/rysie-2026.git
   git branch -M main
   git push -u origin main
   ```

### Krok 2: Połączenie z Vercel
1. Zaloguj się na [vercel.com](https://vercel.com).
2. Kliknij **„Add New...”** -> **„Project”**.
3. Wybierz repozytorium `rysie-2026`.
4. (Opcjonalnie) W sekcji **Environment Variables** możesz podać własny login i hasło:
   - `ADMIN_LOGIN` = `twoj_login`
   - `ADMIN_PASSWORD` = `twoje_tajne_haslo`
   *(jeśli pominiesz, domyślnie działa `organizator` / `rysie2026`)*.
5. Kliknij **Deploy**. Po ok. 60 sekundach Twoja aplikacja jest dostępna w sieci pod adresem `https://twoja-nazwa.vercel.app`!

### Krok 3 (Opcjonalny): Praca wielu osób na żywo z różnych telefonów
Domyślnie aplikacja zapisuje dane w pamięci urządzenia z możliwością eksportu/importu.  
Jeśli chcesz, by **kilka osób liczyło głosy w tej samej chwili na różnych telefonach i widziało aktualizacje na żywo**:
1. W panelu projektu na Vercel przejdź do zakładki **Storage** / **Integrations**.
2. Dodaj darmową bazę **Upstash Redis** (1 kliknięcie, 10 000 zapytań/dzień za darmo).
3. Vercel automatycznie ustawi zmienne `UPSTASH_REDIS_REST_URL` oraz `UPSTASH_REDIS_REST_TOKEN`.
4. Gotowe! Wszystkie telefony będą automatycznie synchronizować się w czasie rzeczywistym.

---

## 💻 Uruchomienie lokalne na komputerze

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom serwer developerski:
   ```bash
   npm run dev
   ```
3. Otwórz w przeglądarce: [http://localhost:3000](http://localhost:3000).

---

## 👥 Domyślne dane dostępowe
- **Login:** `organizator`
- **Hasło:** `rysie2026`
