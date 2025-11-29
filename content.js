// Content script dla egzamin-programista.pl
// Ten skrypt automatycznie wypełnia testy INF.04

// Załaduj bazę danych
let enabled = false;
let targetScore = 75;
let delay = 500;
let isRunning = false;

// Wczytaj ustawienia
chrome.storage.local.get(['enabled', 'targetScore', 'delay'], (data) => {
  enabled = data.enabled || false;
  targetScore = data.targetScore || 75;
  delay = data.delay || 500;
  
  if (enabled) {
    console.log('🎓 INF.04 Auto Test włączony!');
    init();
  }
});

// Nasłuchuj wiadomości z popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    enabled = true;
    targetScore = message.targetScore;
    delay = message.delay;
    init();
  } else if (message.action === 'stop') {
    enabled = false;
    isRunning = false;
    console.log('⏹️ INF.04 Auto Test zatrzymany');
  }
});

// Inicjalizacja
function init() {
  if (isRunning) return;
  isRunning = true;
  
  console.log(`🎯 Cel: ${targetScore}%`);
  
  // Dodaj wizualny wskaźnik
  addStatusIndicator();
  
  // Poczekaj chwilę na załadowanie strony
  setTimeout(() => {
    solveTest();
  }, 1000);
}

// Dodaj wizualny wskaźnik na stronie
function addStatusIndicator() {
  // Usuń poprzedni, jeśli istnieje
  const existing = document.getElementById('inf04-auto-indicator');
  if (existing) existing.remove();
  
  const indicator = document.createElement('div');
  indicator.id = 'inf04-auto-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      animation: slideIn 0.5s ease;
    ">
      <div style="margin-bottom: 5px;">🎓 INF.04 Auto Test</div>
      <div style="font-size: 12px; opacity: 0.9;">Cel: ${targetScore}%</div>
      <div id="progress-text" style="font-size: 11px; opacity: 0.8; margin-top: 5px;">Inicjalizacja...</div>
    </div>
  `;
  
  // Dodaj animację
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(indicator);
}

// Aktualizuj wskaźnik postępu
function updateProgress(text) {
  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = text;
  }
}

// Główna funkcja rozwiązywania testu
async function solveTest() {
  if (!enabled || !isRunning) return;
  
  console.log('🔍 Szukam pytań...');
  updateProgress('Szukam pytań...');
  
  // Znajdź wszystkie pytania na stronie
  const questions = findAllQuestions();
  console.log(`📝 Znaleziono ${questions.length} pytań`);
  
  if (questions.length === 0) {
    updateProgress('❌ Nie znaleziono pytań');
    return;
  }
  
  // Oblicz ile odpowiedzi powinno być poprawnych
  const targetCorrect = Math.round(questions.length * (targetScore / 100));
  const correctIndices = selectRandomQuestions(questions.length, targetCorrect);
  
  console.log(`✅ Zaznaczę ${targetCorrect}/${questions.length} poprawnych odpowiedzi`);
  updateProgress(`Wypełniam: 0/${questions.length}`);
  
  // Wypełnij odpowiedzi z opóźnieniem
  console.log(`🚀 Rozpoczynam wypełnianie ${questions.length} pytań...`);
  console.log(`🎯 Cel: ${targetCorrect} poprawnych (${targetScore}%)`);
  
  let foundInDatabase = 0;
  let notFoundInDatabase = 0;
  
  for (let i = 0; i < questions.length; i++) {
    // Sprawdź czy użytkownik nie zatrzymał
    if (!enabled || !isRunning) {
      console.log('⏹️ Przerwano przez użytkownika');
      break;
    }
    
    const shouldBeCorrect = correctIndices.includes(i);
    
    console.log(`\n━━━ Pytanie ${i + 1}/${questions.length} ━━━`);
    console.log(`📝 Tekst: ${questions[i].text.substring(0, 80)}...`);
    console.log(`🎯 Cel: ${shouldBeCorrect ? 'POPRAWNA ✅' : 'BŁĘDNA ❌'}`);
    
    // Sprawdź czy pytanie jest w bazie (dla statystyk)
    const dbQuestion = findInDatabase(questions[i].text);
    const inDB = dbQuestion !== null && dbQuestion.correct;
    if (inDB) {
      foundInDatabase++;
    } else {
      notFoundInDatabase++;
    }
    
    try {
      await answerQuestion(questions[i], shouldBeCorrect, i + 1, questions.length);
    } catch (error) {
      console.error(`❌ Krytyczny błąd przy pytaniu ${i + 1}:`, error);
      // Kontynuuj mimo błędu
    }
    
    // Opóźnienie między pytaniami
    if (i < questions.length - 1) { // Nie czekaj po ostatnim pytaniu
      await sleep(delay);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ZAKOŃCZONO WYPEŁNIANIE TESTU!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Wypełniono: ${questions.length} pytań`);
  console.log(`✅ Celowano w: ${targetCorrect} poprawnych (${targetScore}%)`);
  console.log(`❌ Celowano w: ${questions.length - targetCorrect} błędnych (${100 - targetScore}%)`);
  console.log(`\n📚 Statystyki bazy danych:`);
  console.log(`   ✅ Znaleziono w bazie: ${foundInDatabase} pytań (${(foundInDatabase/questions.length*100).toFixed(1)}%)`);
  console.log(`   ❌ Nie znaleziono: ${notFoundInDatabase} pytań (${(notFoundInDatabase/questions.length*100).toFixed(1)}%)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  updateProgress(`✅ Gotowe: ${targetCorrect}/${questions.length}`);
  
  // Pokaż podsumowanie
  setTimeout(() => {
    showSummary(questions.length, targetCorrect);
  }, 1000);
}

// Znajdź wszystkie pytania na stronie
function findAllQuestions() {
  const questions = [];
  
  console.log('🔍 Szukam pytań na stronie...');
  
  // Strategia: Znajdź checkboxy i grupuj je po najbliższym wspólnym rodzicu
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  console.log(`📦 Znaleziono ${allCheckboxes.length} checkboxów`);
  
  if (allCheckboxes.length === 0) {
    console.error('❌ Nie znaleziono żadnych checkboxów!');
    return [];
  }
  
  // Tablica przetworzonych checkboxów (aby nie grupować tego samego 2 razy)
  const processed = new Set();
  
  allCheckboxes.forEach((checkbox, index) => {
    if (processed.has(checkbox)) return;
    
    // Znajdź "rodzeństwo" - inne checkboxy w tej samej grupie
    const siblings = [checkbox];
    processed.add(checkbox);
    
    // Znajdź wspólnego rodzica, który zawiera 2-6 checkboxów (1 pytanie)
    let parent = checkbox.parentElement;
    
    for (let depth = 0; depth < 15; depth++) {
      if (!parent) break;
      
      // Policz checkboxy w tym kontenerze
      const checkboxesInParent = parent.querySelectorAll('input[type="checkbox"]');
      const count = checkboxesInParent.length;
      
      // Jeśli ma 2-6 checkboxów, to prawdopodobnie jest to kontener pytania
      if (count >= 2 && count <= 6) {
        // Sprawdź czy to nowe pytanie (nie przetworzone wcześniej)
        const allProcessed = Array.from(checkboxesInParent).every(cb => processed.has(cb));
        
        if (!allProcessed) {
          // Znaleziono nowe pytanie!
          // Znajdź tekst pytania - NOWA LEPSZA METODA
          let questionText = '';
          
          // Metoda 1: Szukaj pierwszego diva z tekstem pytania (przed checkboxami)
          const children = Array.from(parent.children);
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            
            // Sprawdź czy to nie checkbox
            if (child.querySelector('input[type="checkbox"]')) {
              continue; // Pomiń elementy z checkboxami
            }
            
            const text = child.textContent.trim();
            
            // Pytanie zazwyczaj zaczyna się od numeru i ma więcej niż 10 znaków
            if (text.match(/^\d+\./) && text.length > 10) {
              questionText = text;
              break;
            }
            
            // Lub ma długi tekst (>30 znaków) i jest na początku
            if (i <= 2 && text.length > 30 && !text.match(/^[A-D]\./)) {
              questionText = text;
              break;
            }
          }
          
          // Metoda 2: Jeśli nie znaleziono, wyciągnij tekst z parent ale BEZ odpowiedzi A/B/C/D
          if (!questionText || questionText === '...') {
            const fullText = parent.textContent;
            // Usuń odpowiedzi A., B., C., D.
            const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            // Pierwsza linia z numerem to pytanie
            for (const line of lines) {
              if (line.match(/^\d+\./) && line.length > 10 && !line.match(/^[A-D]\./)) {
                questionText = line;
                break;
              }
            }
            
            // Fallback: pierwsza długa linia
            if (!questionText) {
              questionText = lines.find(l => l.length > 30 && !l.match(/^[A-D]\./)) || lines[0] || '';
            }
          }
          
          // Usuń numer pytania
          questionText = questionText
            .replace(/^\d+\.\s*/, '')
            .trim()
            .substring(0, 500); // Ogranicz długość
          
          // Oznacz wszystkie checkboxy jako przetworzone
          checkboxesInParent.forEach(cb => processed.add(cb));
          
          // Sortuj checkboxy według etykiet A, B, C, D
          const sortedCheckboxes = sortCheckboxesByLabel(Array.from(checkboxesInParent), parent);
          
          // Dodaj pytanie
          questions.push({
            element: parent,
            text: questionText,
            checkboxes: sortedCheckboxes
          });
          
          console.log(`✅ Pytanie ${questions.length}: "${questionText.substring(0, 60)}..." (${count} opcji)`);
        }
        
        break;
      }
      
      parent = parent.parentElement;
    }
  });
  
  console.log(`🎯 Gotowych pytań do wypełnienia: ${questions.length}`);
  
  // Jeśli nic nie znaleziono, spróbuj prostszej metody
  if (questions.length === 0) {
    console.warn('⚠️ Standardowa metoda nie znalazła pytań, próbuję alternatywnej...');
    return findQuestionsAlternative();
  }
  
  return questions;
}

// Alternatywna metoda wykrywania pytań - NOWA WERSJA dla egzamin-programista.pl
function findQuestionsAlternative() {
  console.log('🔄 Alternatywna metoda wykrywania...');
  
  const questions = [];
  
  // Ta strona ma checkboxy z ID: ansa1, ansb1, ansc1, ansd1, ansa2, ansb2...
  // Znajdź główny formularz
  const form = document.querySelector('form#formegzamin');
  
  if (!form) {
    console.error('❌ Nie znaleziono formularza #formegzamin!');
    return [];
  }
  
  console.log('✅ Znaleziono formularz z testami');
  
  // Znajdź wszystkie divy z odpowiedziami (klasa .odpowiedzE)
  const answerDivs = form.querySelectorAll('div.odpowiedzE');
  console.log(`📦 Znaleziono ${answerDivs.length} divów z odpowiedziami`);
  
  // Grupuj odpowiedzi po numerze pytania (z ID)
  const questionMap = new Map();
  
  answerDivs.forEach((div) => {
    const checkbox = div.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    
    // Wyciągnij numer pytania z ID (np. "odpa1" -> pytanie 1, "odpa2" -> pytanie 2)
    const match = div.id.match(/^odp[a-d](\d+)$/);
    if (match) {
      const questionNum = parseInt(match[1]);
      
      if (!questionMap.has(questionNum)) {
        questionMap.set(questionNum, {
          number: questionNum,
          checkboxes: [],
          divs: []
        });
      }
      
      questionMap.get(questionNum).checkboxes.push(checkbox);
      questionMap.get(questionNum).divs.push(div);
    }
  });
  
  console.log(`📝 Znaleziono ${questionMap.size} pytań`);
  
  // Dla każdego pytania - znajdź tekst pytania
  questionMap.forEach((data, questionNum) => {
    if (data.checkboxes.length < 2) return; // Ignoruj niepełne pytania
    
    // Znajdź tekst pytania - szukaj elementu z ID "pyt{questionNum}"
    const questionDiv = document.querySelector(`#pyt${questionNum}`);
    let questionText = '';
    
    if (questionDiv) {
      // Wyciągnij tekst z diva z pytaniem
      questionText = questionDiv.textContent.trim();
      
      // Usuń numer pytania z początku
      questionText = questionText.replace(/^\d+\.\s*/, '').trim();
    } else {
      // Fallback: szukaj tekstu przed pierwszą odpowiedzią
      const firstDiv = data.divs[0];
      let current = firstDiv.previousElementSibling;
      
      // Idź wstecz przez rodzeństwo szukając tekstu pytania
      for (let i = 0; i < 10 && current; i++) {
        const text = current.textContent.trim();
        
        // Sprawdź czy to prawdopodobnie pytanie
        if (text.length > 30 && !text.match(/^[A-D]\./)) {
          questionText = text.replace(/^\d+\.\s*/, '').trim();
          break;
        }
        
        current = current.previousElementSibling;
      }
      
      // Jeśli nadal nic nie znaleziono, użyj numeru jako fallback
      if (!questionText) {
        questionText = `Pytanie ${questionNum}`;
      }
    }
    
    // Sortuj checkboxy w kolejności A, B, C, D
    const sortedCheckboxes = [];
    ['a', 'b', 'c', 'd'].forEach(letter => {
      const div = document.querySelector(`#odp${letter}${questionNum}`);
      if (div) {
        const cb = div.querySelector('input[type="checkbox"]');
        if (cb) sortedCheckboxes.push(cb);
      }
    });
    
    questions.push({
      element: form,
      text: questionText.substring(0, 500),
      checkboxes: sortedCheckboxes.length > 0 ? sortedCheckboxes : data.checkboxes,
      number: questionNum
    });
    
    console.log(`✅ Alt pytanie ${questionNum}: "${questionText.substring(0, 50)}..." (${sortedCheckboxes.length} opcji)`);
  });
  
  // Sortuj pytania po numerze
  questions.sort((a, b) => a.number - b.number);
  
  console.log(`🎯 Alternatywna metoda znalazła: ${questions.length} pytań`);
  return questions;
}

// Sortuj checkboxy według etykiet A, B, C, D
function sortCheckboxesByLabel(checkboxes, parent) {
  if (!parent) return checkboxes;
  
  const labeled = [];
  
  checkboxes.forEach((checkbox, idx) => {
    // Znajdź etykietę (A, B, C, D) w rodzicu checkboxa
    let label = null;
    let checkParent = checkbox.parentElement;
    
    for (let i = 0; i < 5; i++) {
      if (!checkParent) break;
      
      const text = checkParent.textContent.trim();
      // Szukaj wzorca: "A." lub "A:" lub "A " na początku
      const match = text.match(/^\s*([A-D])[\.\:\s]/);
      if (match) {
        label = match[1];
        break;
      }
      
      // Alternatywnie szukaj w całym tekście (dla przypadku gdzie A/B/C/D nie jest na początku)
      const anyMatch = text.match(/([A-D])[\.\:]/);
      if (anyMatch && text.length < 50) {
        label = anyMatch[1];
        break;
      }
      
      checkParent = checkParent.parentElement;
    }
    
    // Jeśli nie znaleziono etykiety, użyj pozycji jako fallback
    labeled.push({ 
      checkbox, 
      label: label || String.fromCharCode(65 + idx), // A, B, C, D według kolejności
      originalIndex: idx
    });
  });
  
  console.log(`   🔤 Sortowanie checkboxów: ${labeled.map(l => l.label).join(', ')}`);
  
  // Sortuj według etykiety
  labeled.sort((a, b) => a.label.localeCompare(b.label));
  
  console.log(`   ✅ Po sortowaniu: ${labeled.map(l => l.label).join(', ')}`);
  
  return labeled.map(item => item.checkbox);
}

// Odpowiedź na pytanie - NOWA WERSJA porównująca TEKSTY odpowiedzi
async function answerQuestion(question, shouldBeCorrect, index, total) {
  try {
    updateProgress(`Wypełniam: ${index}/${total}`);
    
    let targetCheckbox = null;
    let answerIndex = -1;
    
    if (shouldBeCorrect) {
      // Spróbuj znaleźć poprawną odpowiedź w bazie danych
      const dbQuestion = findInDatabase(question.text);
      
      if (dbQuestion !== null && dbQuestion.correct && dbQuestion.answers) {
        // Mamy pytanie z bazy! Teraz znajdź TEKST poprawnej odpowiedzi
        const correctLetter = dbQuestion.correct;
        const correctAnswerText = dbQuestion.answers[correctLetter];
        
        if (correctAnswerText) {
          console.log(`✅ Pytanie ${index}/${total}: Znaleziono w bazie`);
          console.log(`   Poprawna odpowiedź (baza): ${correctLetter}. "${correctAnswerText.substring(0, 60)}..."`);
          
          // Teraz znajdź checkbox z tym samym tekstem na stronie
          targetCheckbox = findCheckboxByAnswerText(question.checkboxes, correctAnswerText);
          
          if (targetCheckbox) {
            answerIndex = question.checkboxes.indexOf(targetCheckbox);
            const actualLetter = String.fromCharCode(65 + answerIndex);
            console.log(`   📍 Znaleziono na stronie pod literą: ${actualLetter}`);
          } else {
            console.warn(`   ⚠️ NIE znaleziono tej odpowiedzi na stronie! Losuję...`);
            answerIndex = Math.floor(Math.random() * question.checkboxes.length);
            targetCheckbox = question.checkboxes[answerIndex];
          }
        } else {
          console.warn(`   ⚠️ Brak tekstu odpowiedzi w bazie, losuję...`);
          answerIndex = Math.floor(Math.random() * question.checkboxes.length);
          targetCheckbox = question.checkboxes[answerIndex];
        }
      } else {
        // Nie ma w bazie - losuj
        answerIndex = Math.floor(Math.random() * question.checkboxes.length);
        targetCheckbox = question.checkboxes[answerIndex];
        console.log(`🎲 Pytanie ${index}/${total}: NIE w bazie → losowa ${String.fromCharCode(65 + answerIndex)}`);
      }
    } else {
      // Celowo błędna odpowiedź
      const dbQuestion = findInDatabase(question.text);
      let correctIndex = -1;
      
      if (dbQuestion !== null && dbQuestion.correct && dbQuestion.answers) {
        const correctAnswerText = dbQuestion.answers[dbQuestion.correct];
        if (correctAnswerText) {
          const correctCheckbox = findCheckboxByAnswerText(question.checkboxes, correctAnswerText);
          if (correctCheckbox) {
            correctIndex = question.checkboxes.indexOf(correctCheckbox);
          }
        }
      }
      
      // Wybierz losową odpowiedź OPRÓCZ poprawnej
      answerIndex = getWrongAnswer(question.checkboxes.length, correctIndex);
      targetCheckbox = question.checkboxes[answerIndex];
      console.log(`❌ Pytanie ${index}/${total}: Celowo błędna → ${String.fromCharCode(65 + answerIndex)}`);
    }
    
    // Zaznacz odpowiedź
    if (targetCheckbox && answerIndex >= 0) {
      // DEBUG: Sprawdź co klikamy
      const parent = targetCheckbox.parentElement;
      const answerText = parent ? parent.textContent.trim().substring(0, 100) : 'brak tekstu';
      console.log(`   🖱️ Klikam: ${String.fromCharCode(65 + answerIndex)}. "${answerText}"`);
      
      // Symuluj kliknięcie
      try {
        targetCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        console.warn(`⚠️ Błąd scrollIntoView:`, e);
      }
      
      await sleep(100);
      targetCheckbox.click();
      
      // Sprawdź czy zaznaczony
      await sleep(50);
      console.log(`   ${targetCheckbox.checked ? '✅' : '❌'} Checkbox ${targetCheckbox.checked ? 'ZAZNACZONY' : 'NIE zaznaczony!'}`);
      
      highlightAnswer(targetCheckbox, shouldBeCorrect);
    } else {
      console.warn(`⚠️ Pytanie ${index}: Nie znaleziono checkboxa!`);
    }
  } catch (error) {
    console.error(`❌ Błąd przy pytaniu ${index}:`, error);
  }
}

// Znajdź checkbox po tekście odpowiedzi
function findCheckboxByAnswerText(checkboxes, targetAnswerText) {
  if (!targetAnswerText) return null;
  
  // Normalizuj tekst do porównania
  const normalizeForComparison = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const targetNormalized = normalizeForComparison(targetAnswerText);
  
  // Przeszukaj wszystkie checkboxy
  for (const checkbox of checkboxes) {
    const parent = checkbox.parentElement;
    if (!parent) continue;
    
    const answerText = parent.textContent.trim();
    // Usuń literę A./B./C./D. z początku
    const cleanText = answerText.replace(/^[A-D]\.?\s*/, '');
    const normalized = normalizeForComparison(cleanText);
    
    // Dokładne dopasowanie
    if (normalized === targetNormalized) {
      return checkbox;
    }
    
    // Częściowe dopasowanie (85%)
    if (normalized.length > 20 && targetNormalized.length > 20) {
      const similarity = calculateTextSimilarity(normalized, targetNormalized);
      if (similarity > 0.85) {
        return checkbox;
      }
    }
  }
  
  return null;
}

// Prosta funkcja podobieństwa tekstów
function calculateTextSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1.0;
  
  // Policz ile znaków się zgadza
  let matches = 0;
  const minLen = Math.min(len1, len2);
  
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / maxLen;
}

// Znajdź odpowiedź w bazie danych - ZWRACA OBIEKT z pełnymi danymi pytania
function findInDatabase(questionText) {
  // Sprawdź czy baza danych jest załadowana
  if (typeof findQuestionInDB === 'undefined') {
    console.warn('⚠️ Baza danych pytań nie została załadowana!');
    return null;
  }
  
  // DEBUG: Pokaż co szukamy
  console.log(`   🔍 Szukam w bazie: "${questionText.substring(0, 100)}..."`);
  
  // Użyj funkcji z questions_db.js
  const foundQuestion = findQuestionInDB(questionText);
  
  if (foundQuestion && foundQuestion.correct) {
    console.log(`   ✅ ZNALEZIONO! ID: ${foundQuestion.id}, Odpowiedź: ${foundQuestion.correct}`);
    
    // Zwróć cały obiekt pytania (nie tylko index!)
    return foundQuestion;
  }
  
  console.log(`   ❌ NIE znaleziono w bazie`);
  return null;
}

// Użyj AI do odpowiedzi (w tej wersji losowa odpowiedź)
async function getAIAnswer(questionText, numOptions) {
  // W pełnej wersji można by tutaj dodać integrację z API (np. Gemini, GPT)
  // Na razie zwróć losową odpowiedź
  return Math.floor(Math.random() * numOptions);
}

// Wybierz celowo błędną odpowiedź
function getWrongAnswer(numOptions, correctIndex) {
  if (correctIndex === null || correctIndex === -1 || correctIndex === undefined) {
    return Math.floor(Math.random() * numOptions);
  }
  
  let wrongIndex;
  let attempts = 0;
  do {
    wrongIndex = Math.floor(Math.random() * numOptions);
    attempts++;
  } while (wrongIndex === correctIndex && attempts < 10);
  
  return wrongIndex;
}

// Wybierz losowe pytania do poprawnego odpowiedzenia
function selectRandomQuestions(total, count) {
  const indices = [];
  while (indices.length < count) {
    const rand = Math.floor(Math.random() * total);
    if (!indices.includes(rand)) {
      indices.push(rand);
    }
  }
  return indices;
}

// Dodaj wizualne podświetlenie zaznaczonej odpowiedzi
function highlightAnswer(checkbox, isCorrect) {
  const parent = checkbox.parentElement;
  if (parent) {
    parent.style.transition = 'all 0.3s ease';
    parent.style.backgroundColor = isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)';
    parent.style.borderRadius = '5px';
    parent.style.padding = '5px';
  }
}

// Pokaż podsumowanie
function showSummary(total, correct) {
  const percentage = Math.round((correct / total) * 100);
  
  const summary = document.createElement('div');
  summary.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      z-index: 10001;
      text-align: center;
      font-family: 'Segoe UI', sans-serif;
      animation: popIn 0.5s ease;
    ">
      <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Test wypełniony!</div>
      <div style="font-size: 18px; opacity: 0.9;">Przewidywany wynik:</div>
      <div style="font-size: 48px; font-weight: bold; margin: 20px 0;">${percentage}%</div>
      <div style="font-size: 14px; opacity: 0.8;">${correct}/${total} poprawnych odpowiedzi</div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        margin-top: 30px;
        padding: 12px 30px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      ">OK</button>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popIn {
      from {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(summary);
}

// Funkcja pomocnicza sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('🎓 INF.04 Auto Test załadowany');

