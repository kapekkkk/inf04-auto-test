# 📦 Jak udostępnić rozszerzenie znajomym

## ⚠️ UWAGA!
To rozszerzenie jest TYLKO do celów edukacyjnych!
Nie publikuj publicznie ani w Chrome Web Store.

---

## Metoda 1: Udostępnij folder (NAJPROŚCIEJ)

### Dla Ciebie:
1. Spakuj folder `inf04cheat` do ZIP:
   ```bash
   cd /home/beno/Work
   zip -r inf04cheat.zip inf04cheat/
   ```

2. Wyślij znajomemu plik `inf04cheat.zip`

### Dla znajomego:
1. Rozpakuj ZIP
2. Chrome → `chrome://extensions/`
3. Włącz "Tryb dewelopera"
4. "Załaduj rozpakowane"
5. Wybierz folder `inf04cheat`

---

## Metoda 2: Spakuj jako .CRX (trudniejsze)

### Krok 1: Wygeneruj klucz prywatny

```bash
cd /home/beno/Work/inf04cheat

# Stwórz klucz
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
```

### Krok 2: Dodaj klucz do manifestu

**NIE DODAWAJ!** Klucz jest prywatny. Zamiast tego:

1. W Chrome → `chrome://extensions/`
2. Kliknij "Pakuj rozszerzenie"
3. Wybierz folder `inf04cheat`
4. Wygeneruje się plik `.crx`

### Krok 3: Udostępnij

⚠️ **PROBLEM:** Chrome nie pozwala instalować .CRX z zewnątrz Web Store!

**Rozwiązanie:** Użyj Metody 1 (folder ZIP)

---

## Metoda 3: Prywatny hosting (dla grupy osób)

Jeśli chcesz udostępnić większej grupie:

### Opcja A: GitHub (prywatne repo)

1. Stwórz **PRYWATNE** repozytorium na GitHub
2. Dodaj znajomych jako collaborators
3. Oni sklonują repo i załadują lokalnie

```bash
git init
git add .
git commit -m "INF.04 Auto Test"
git remote add origin https://github.com/TWOJA_NAZWA/inf04-private.git
git push -u origin main
```

### Opcja B: Dropbox/Google Drive

1. Upload folderu do Dropbox/Drive
2. Udostępnij link tylko znajomym
3. Oni pobiorą i załadują lokalnie

---

## ❌ CZEGO NIE ROBIĆ:

### 1. ❌ NIE publikuj w Chrome Web Store
- Google odrzuci
- Może zablokować konto

### 2. ❌ NIE publikuj publicznie na GitHub
- To narzędzie do oszukiwania
- Szkoła może znaleźć
- Etycznie wątpliwe

### 3. ❌ NIE sprzedawaj
- To edukacyjny projekt
- Nielegalne

### 4. ❌ NIE używaj na prawdziwych egzaminach
- Oszustwo
- Konsekwencje prawne

---

## ✅ DOBRE PRAKTYKI:

### 1. ✅ Zachowaj prywatność
- Udostępniaj tylko zaufanym znajomym
- Nie reklamuj publicznie

### 2. ✅ Używaj do nauki
- Testuj swoją wiedzę
- Sprawdzaj odpowiedzi
- Ucz się z błędów

### 3. ✅ Aktualizuj odpowiedzialnie
- Jeśli dodajesz funkcje
- Testuj przed udostępnieniem

---

## 📝 Instrukcja dla znajomego (wyślij mu to):

```
🎓 INF.04 Auto Test - Instrukcja instalacji

1. Pobierz plik inf04cheat.zip
2. Rozpakuj do folderu
3. Otwórz Chrome
4. Wejdź na: chrome://extensions/
5. Włącz "Tryb dewelopera" (prawy górny róg)
6. Kliknij "Załaduj rozpakowane rozszerzenie"
7. Wybierz folder inf04cheat
8. Gotowe!

Jak używać:
- Wejdź na test INF.04
- Kliknij ikonę rozszerzenia
- Ustaw % (np. 75%)
- START → odśwież stronę
- Test wypełni się sam!

⚠️ TYLKO do nauki! Nie używaj na prawdziwych egzaminach!
```

---

## 🔐 Bezpieczeństwo:

### Co zawiera plik ZIP:
- ✅ JavaScript (kod źródłowy)
- ✅ JSON (baza pytań)
- ✅ HTML/CSS (interfejs)
- ✅ Obrazki (ikony)

### Czego NIE zawiera:
- ❌ Wirusy
- ❌ Malware
- ❌ Keyloggery
- ❌ Połączenia zewnętrzne

### Uprawnienia rozszerzenia:
```json
"permissions": [
  "storage",     // Zapisywanie ustawień
  "activeTab"    // Dostęp do aktywnej karty
]
```

Rozszerzenie działa **TYLKO** na:
- `https://egzamin-programista.pl/testy-inf04-*`
- Nie ma dostępu do innych stron!

---

## 💾 Backup i aktualizacje:

### Zachowaj kopię zapasową:
```bash
# Stwórz backup z datą
cp -r inf04cheat inf04cheat_backup_$(date +%Y%m%d)
```

### Aktualizacja dla znajomych:
1. Wyślij nową wersję ZIP
2. Oni zastępują stary folder nowym
3. Chrome → przeładuj rozszerzenie (↻)

---

**Pamiętaj:** To narzędzie jest do nauki, nie do oszukiwania! 🎓

