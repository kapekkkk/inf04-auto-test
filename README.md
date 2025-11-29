# 🎓 INF.04 Auto Test - Rozszerzenie Chrome

Automatyczne rozwiązywanie testów INF.04 na stronie [egzamin-programista.pl](https://egzamin-programista.pl/testy-inf04-projektowanie-programowanie-i-testowanie-aplikacji/) z kontrolą procentu poprawnych odpowiedzi.

> ⚠️ **UWAGA**: To narzędzie jest przeznaczone TYLKO do celów edukacyjnych i osobistej nauki. Nie używaj go podczas oficjalnych egzaminów!

## 🚀 Funkcje

- ✅ Automatyczne wypełnianie testów INF.04
- 🎯 Kontrola docelowego wyniku (0-100%)
- ⏱️ Regulowane opóźnienie między odpowiedziami
- 📊 Wizualne wskaźniki postępu
- 🎨 Ładny interfejs użytkownika
- 🧠 Baza danych pytań + fallback do losowych odpowiedzi

## 📦 Instalacja

### Krok 1: Generuj ikony

1. Otwórz plik `create_icons.html` w przeglądarce
2. Kliknij wszystkie trzy przyciski aby wygenerować ikony:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
3. Zapisz wygenerowane ikony w tym samym folderze co pozostałe pliki

### Krok 2: Załaduj rozszerzenie do Chrome

1. Otwórz Chrome i wejdź na: `chrome://extensions/`
2. Włącz **Tryb dewelopera** (przełącznik w prawym górnym rogu)
3. Kliknij **Załaduj rozpakowane rozszerzenie**
4. Wybierz folder `inf04cheat` zawierający wszystkie pliki
5. Rozszerzenie zostanie załadowane! ✅

### Krok 3: Baza danych (GOTOWA!)

✅ **Rozszerzenie zawiera kompletną bazę:**
- **417 pytań INF.04**
- **100% z poprawnymi odpowiedziami!** 🎯
- Gotowe do użycia bez dodatkowej konfiguracji!

**Chcesz zaktualizować bazę?**
1. Wejdź na: https://www.praktycznyegzamin.pl/inf04/teoria/wszystko/
2. Przewiń całą stronę do końca
3. F12 → wklej zawartość `scraper_v3_with_answers.js`
4. Pobierze się nowy plik JSON
5. Uruchom: `python3 convert_json_to_js.py`
6. Przeładuj rozszerzenie

## 🎮 Użycie

### Podstawowe użycie

1. Wejdź na stronę z testem: https://egzamin-programista.pl/testy-inf04-projektowanie-programowanie-i-testowanie-aplikacji/
2. Kliknij ikonę rozszerzenia w pasku narzędzi Chrome
3. Ustaw:
   - **Docelowy wynik** - np. 75% (zalecane 70-85% aby było realistyczne)
   - **Opóźnienie** - np. 500ms między zaznaczaniem odpowiedzi
4. Kliknij **▶️ Start**
5. Odśwież stronę z testem
6. Rozszerzenie automatycznie wypełni test! 🎉

### Zatrzymanie

- Kliknij ikonę rozszerzenia i naciśnij **⏹️ Stop**

## 📁 Struktura plików

```
inf04cheat/
├── manifest.json          # Konfiguracja rozszerzenia Chrome
├── popup.html            # Interfejs użytkownika (popup)
├── popup.js              # Logika popup (ustawienia)
├── content.js            # Główna logika (wypełnianie testów)
├── database.js           # Baza danych pytań
├── scraper.js            # Scraper do pobierania pytań
├── create_icons.html     # Generator ikon
├── icon16.png            # Ikona 16x16 (generowana)
├── icon48.png            # Ikona 48x48 (generowana)
├── icon128.png           # Ikona 128x128 (generowana)
└── README.md             # Ten plik
```

## 🔧 Jak to działa?

1. **Content Script** (`content.js`) działa na stronie egzamin-programista.pl
2. Wykrywa wszystkie pytania i checkboxy na stronie
3. Oblicza ile odpowiedzi musi być poprawnych aby osiągnąć docelowy wynik
4. Dla każdego pytania:
   - Przeszukuje bazę **417 pytań** z poprawnymi odpowiedziami
   - **Jeśli znajdzie w bazie** → zaznacza poprawną odpowiedź ✅
   - **Jeśli nie znajdzie** → losuje odpowiedź 🎲
   - **Celowo zaznacza błędne** odpowiedzi aby osiągnąć docelowy procent (np. 75%)
5. Dodaje wizualne wskaźniki postępu i podsumowanie

**Baza pytań:** `questions_db.js` - 417 pytań ze 100% poprawnymi odpowiedziami!

## 🎨 Personalizacja

### Zmiana docelowego wyniku

Domyślnie: **75%** (realistyczny wynik)
- Możesz ustawić 0-100% w popup
- Zalecane: 70-85% dla wiarygodności

### Zmiana opóźnienia

Domyślnie: **500ms** między odpowiedziami
- Mniejsze opóźnienie = szybsze wypełnianie
- Większe opóźnienie = bardziej naturalne

### Dodanie nowych pytań

Edytuj `database.js` i dodaj wpisy w formacie:

```javascript
{
  question: "Treść pytania...",
  answers: {
    "A": "Odpowiedź A",
    "B": "Odpowiedź B",
    "C": "Odpowiedź C",
    "D": "Odpowiedź D"
  },
  correct: "B"  // Poprawna odpowiedź
}
```

## 🤖 Integracja z AI (opcjonalnie)

Możesz dodać integrację z AI API (np. Google Gemini, OpenAI) aby rozszerzenie samo odpowiadało na nieznane pytania:

1. Zarejestruj się na https://aistudio.google.com/ (darmowe API)
2. Pobierz klucz API
3. W pliku `content.js` znajdź funkcję `getAIAnswer()`
4. Dodaj wywołanie API:

```javascript
async function getAIAnswer(questionText, numOptions) {
  const API_KEY = 'TWOJ_KLUCZ_API';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Odpowiedz na pytanie egzaminacyjne INF.04. Podaj tylko literę (A, B, C lub D) bez dodatkowych wyjaśnień.\n\nPytanie: ${questionText}`
        }]
      }]
    })
  });
  
  const data = await response.json();
  const answer = data.candidates[0].content.parts[0].text.trim();
  
  // Konwertuj literę na index (A=0, B=1, C=2, D=3)
  const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  return letterToIndex[answer] || Math.floor(Math.random() * numOptions);
}
```

## 📝 Licencja

Projekt edukacyjny - do użytku osobistego. Autor nie ponosi odpowiedzialności za niewłaściwe użycie.


