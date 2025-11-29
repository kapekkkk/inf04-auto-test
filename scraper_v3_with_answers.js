/**
 * 🎓 INF.04 Question Scraper v3 - Z POPRAWNYMI ODPOWIEDZIAMI!
 * 
 * JAK UŻYWAĆ:
 * 1. Otwórz: https://www.praktycznyegzamin.pl/inf04/teoria/wszystko/
 * 2. Poczekaj aż CAŁA strona się załaduje (przewiń na dół!)
 * 3. Naciśnij F12 (Console)
 * 4. Skopiuj CAŁY ten kod
 * 5. Wklej do konsoli i naciśnij Enter
 * 6. Plik inf04_questions_with_answers.json zostanie pobrany!
 */

(async function() {
  'use strict';
  
  console.log('%c🔍 INF.04 Scraper v3 - Z ODPOWIEDZIAMI!', 'color: #667eea; font-size: 16px; font-weight: bold');
  
  const questions = [];
  
  // Poczekaj na pełne załadowanie
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('📦 Szukam pytań z odpowiedziami...');
  
  // Znajdź wszystkie divy na stronie
  const allDivs = document.querySelectorAll('div');
  
  console.log(`📊 Znaleziono ${allDivs.length} divów na stronie`);
  
  // Przejdź przez wszystkie divy i szukaj tych które wyglądają jak pytania
  for (let i = 0; i < allDivs.length; i++) {
    const div = allDivs[i];
    
    // Sprawdź czy div ma dzieci
    const children = Array.from(div.children);
    if (children.length < 4) continue;
    
    // Pierwszy child powinien zawierać pytanie (zaczyna się od cyfry)
    const firstChild = children[0];
    const firstText = firstChild.textContent.trim();
    
    // Sprawdź czy zaczyna się od numeru pytania
    const questionMatch = firstText.match(/^(\d+)\.\s*(.+)/);
    if (!questionMatch) continue;
    
    const number = parseInt(questionMatch[1]);
    const questionText = questionMatch[2].trim();
    
    if (!questionText || questionText.length < 5) continue;
    
    // Teraz szukaj odpowiedzi w kolejnych children
    const answers = {};
    let correctAnswer = null;
    let foundAnswers = 0;
    
    for (let j = 1; j < children.length && foundAnswers < 4; j++) {
      const child = children[j];
      const strong = child.querySelector('strong');
      
      if (strong) {
        const letter = strong.textContent.trim().replace('.', '');
        
        // Sprawdź czy to A, B, C lub D
        if (letter.match(/^[A-D]$/)) {
          // Pobierz tekst odpowiedzi
          const answerText = child.textContent
            .replace(strong.textContent, '')
            .trim();
          
          if (answerText && answerText.length > 0) {
            answers[letter] = answerText;
            foundAnswers++;
            
            // KLUCZOWE: Sprawdź czy element ma zielone tło (poprawna odpowiedź)
            const style = window.getComputedStyle(child);
            const bgColor = style.backgroundColor;
            const color = style.color;
            const border = style.border;
            
            // Wykryj różne odcienie zieleni
            const isGreen = 
              bgColor.includes('rgb(0, 128, 0)') || // green
              bgColor.includes('rgb(0, 255, 0)') || // lime
              bgColor.includes('rgb(34, 139, 34)') || // forestgreen
              bgColor.includes('rgb(50, 205, 50)') || // limegreen
              bgColor.includes('rgb(144, 238, 144)') || // lightgreen
              bgColor.includes('rgb(152, 251, 152)') || // palegreen
              bgColor.match(/rgba?\(\s*\d+\s*,\s*1\d{2}\s*,/) || // zawiera wysoką wartość G
              color.includes('rgb(0, 128, 0)') ||
              color.includes('rgb(0, 255, 0)') ||
              border.includes('green') ||
              child.classList.toString().toLowerCase().includes('correct') ||
              child.classList.toString().toLowerCase().includes('right') ||
              child.classList.toString().toLowerCase().includes('green');
            
            if (isGreen) {
              correctAnswer = letter;
              console.log(`✅ Znaleziono poprawną: Q${number} → ${letter}`);
            }
          }
        }
      }
    }
    
    // Jeśli znaleźliśmy wszystkie odpowiedzi, dodaj pytanie
    if (foundAnswers >= 3) {
      const normalized = questionText
        .toLowerCase()
        .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      questions.push({
        id: number,
        question: questionText,
        normalized: normalized,
        answers: answers,
        answerCount: foundAnswers,
        correct: correctAnswer
      });
    }
  }
  
  // Statystyki
  const withAnswers = questions.filter(q => q.correct !== null).length;
  const withoutAnswers = questions.length - withAnswers;
  
  console.log(`%c✅ Zescrapowano ${questions.length} pytań!`, 'color: #4CAF50; font-size: 14px; font-weight: bold');
  console.log(`%c📊 Statystyki:`, 'color: #667eea; font-weight: bold');
  console.log(`   Z poprawną odpowiedzią: ${withAnswers} (${(withAnswers/questions.length*100).toFixed(1)}%)`);
  console.log(`   Bez poprawnej odpowiedzi: ${withoutAnswers} (${(withoutAnswers/questions.length*100).toFixed(1)}%)`);
  
  if (questions.length > 0) {
    console.log('%c📊 Przykładowe pytania z odpowiedziami:', 'color: #667eea; font-weight: bold');
    const samplesWithAnswers = questions.filter(q => q.correct).slice(0, 3);
    samplesWithAnswers.forEach(q => {
      console.log(`Q${q.id}: ${q.question.substring(0, 60)}... → Poprawna: ${q.correct}`);
    });
    
    // Eksportuj do JSON
    const json = JSON.stringify(questions, null, 2);
    
    // Pobierz jako plik
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inf04_questions_with_answers.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('%c💾 Plik inf04_questions_with_answers.json został pobrany!', 'color: #4CAF50; font-size: 14px; font-weight: bold');
    console.log('%c🎉 Sprawdź folder Downloads!', 'color: #667eea; font-size: 16px; font-weight: bold');
    
    // Pokaż szczegółowe statystyki
    console.log('');
    console.log('📈 Szczegółowe statystyki:');
    console.log(`   Łączna liczba pytań: ${questions.length}`);
    console.log(`   Pytania z poprawną odpowiedzią: ${withAnswers}`);
    console.log(`   Pytania bez poprawnej odpowiedzi: ${withoutAnswers}`);
    
    if (withAnswers > 0) {
      const answerDistribution = { A: 0, B: 0, C: 0, D: 0 };
      questions.filter(q => q.correct).forEach(q => {
        answerDistribution[q.correct]++;
      });
      console.log(`   Rozkład poprawnych odpowiedzi:`);
      console.log(`      A: ${answerDistribution.A} (${(answerDistribution.A/withAnswers*100).toFixed(1)}%)`);
      console.log(`      B: ${answerDistribution.B} (${(answerDistribution.B/withAnswers*100).toFixed(1)}%)`);
      console.log(`      C: ${answerDistribution.C} (${(answerDistribution.C/withAnswers*100).toFixed(1)}%)`);
      console.log(`      D: ${answerDistribution.D} (${(answerDistribution.D/withAnswers*100).toFixed(1)}%)`);
    }
    
    console.log('');
    console.log('📝 Format danych (pierwsze pytanie):');
    console.log(JSON.stringify(questions[0], null, 2));
  } else {
    console.error('%c❌ Nie znaleziono żadnych pytań!', 'color: #f44336; font-size: 14px; font-weight: bold');
    console.log('');
    console.log('💡 Możliwe przyczyny:');
    console.log('   1. Strona jeszcze się nie załadowała - poczekaj i spróbuj ponownie');
    console.log('   2. Nie przewinąłeś do końca strony - przewiń na dół i spróbuj ponownie');
    console.log('   3. Struktura strony się zmieniła - zgłoś problem');
  }
  
  return questions;
})();

