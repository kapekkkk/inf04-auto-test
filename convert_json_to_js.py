#!/usr/bin/env python3
"""
Konwerter pytań z JSON do JavaScript dla rozszerzenia Chrome
"""

import json
import sys

def convert_json_to_js(input_file, output_file):
    """Konwertuje plik JSON z pytaniami na plik JavaScript"""
    
    print(f'📖 Czytam plik: {input_file}')
    
    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f'✅ Załadowano {len(questions)} pytań')
    
    # Rozpocznij plik JavaScript
    js_content = '''// Baza danych pytań INF.04 - automatycznie wygenerowana z inf04_questions.json
// Pytania zescrapowane z praktycznyegzamin.pl
// UWAGA: Poprawne odpowiedzi (pole "correct") nie są jeszcze uzupełnione
// Możesz je dodać ręcznie lub użyć AI do automatycznego uzupełnienia

const INF04_QUESTIONS_DB = [
'''
    
    # Dodaj każde pytanie
    for i, q in enumerate(questions):
        # Escape single quotes w pytaniu i odpowiedziach
        question = q['question'].replace("'", "\\'").replace('"', '\\"')
        normalized = q['normalized'].replace("'", "\\'").replace('"', '\\"')
        
        answers_str = "{ "
        for letter, text in q['answers'].items():
            text_escaped = text.replace("'", "\\'").replace('"', '\\"')
            answers_str += f'"{letter}": "{text_escaped}", '
        answers_str = answers_str.rstrip(', ') + " }"
        
        correct = f'"{q["correct"]}"' if q.get('correct') else 'null'
        
        js_content += f'''  {{
    id: {q['id']},
    question: "{question}",
    normalized: "{normalized}",
    answers: {answers_str},
    correct: {correct}
  }}'''
        
        # Dodaj przecinek jeśli to nie ostatni element
        if i < len(questions) - 1:
            js_content += ','
        
        js_content += '\n'
    
    # Zakończ plik
    js_content += '''];

// Funkcja do normalizacji tekstu pytania
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

// Funkcja do znalezienia pytania w bazie
function findQuestionInDB(questionText) {
  const normalized = normalizeText(questionText);
  
  // Spróbuj znaleźć dokładne dopasowanie
  for (const q of INF04_QUESTIONS_DB) {
    if (q.normalized === normalized) {
      return q;
    }
  }
  
  // Spróbuj znaleźć częściowe dopasowanie (pierwsze 100 znaków)
  const shortNormalized = normalized.substring(0, 100);
  for (const q of INF04_QUESTIONS_DB) {
    const shortDB = q.normalized.substring(0, 100);
    if (shortNormalized === shortDB) {
      return q;
    }
  }
  
  // Spróbuj znaleźć bardzo luźne dopasowanie (pierwsze 50 znaków)
  const veryShortNormalized = normalized.substring(0, 50);
  for (const q of INF04_QUESTIONS_DB) {
    const veryShortDB = q.normalized.substring(0, 50);
    if (veryShortNormalized === veryShortDB) {
      return q;
    }
  }
  
  return null;
}

// Eksport dla Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INF04_QUESTIONS_DB, findQuestionInDB, normalizeText };
}
'''
    
    # Zapisz plik
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f'💾 Zapisano do: {output_file}')
    print(f'📊 Statystyki:')
    print(f'   - Pytań z 4 odpowiedziami: {sum(1 for q in questions if q.get("answerCount") == 4)}')
    print(f'   - Pytań z < 4 odpowiedziami: {sum(1 for q in questions if q.get("answerCount", 4) < 4)}')
    print(f'   - Pytań z uzupełnioną poprawną odpowiedzią: {sum(1 for q in questions if q.get("correct"))}')
    print('')
    print('✅ Konwersja zakończona!')
    print(f'📝 Plik {output_file} jest gotowy do użycia w rozszerzeniu')

if __name__ == '__main__':
    input_file = 'inf04_questions (2).json'
    output_file = 'questions_db.js'
    
    print('🔄 Konwerter pytań JSON → JavaScript')
    print('=' * 50)
    
    try:
        convert_json_to_js(input_file, output_file)
    except FileNotFoundError:
        print(f'❌ Nie znaleziono pliku: {input_file}')
        print('Upewnij się że plik istnieje w tym samym katalogu')
        sys.exit(1)
    except Exception as e:
        print(f'❌ Błąd: {e}')
        sys.exit(1)

