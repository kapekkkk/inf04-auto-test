#!/usr/bin/env python3
"""
Skrypt pomocniczy do uzupełniania poprawnych odpowiedzi w bazie pytań
Możesz uzupełnić ręcznie lub zintegrować z AI (np. Google Gemini)
"""

import json
import sys

def manual_mode(questions):
    """Tryb ręcznego uzupełniania odpowiedzi"""
    print('\n📝 Tryb ręczny - uzupełniaj odpowiedzi dla każdego pytania\n')
    print('Instrukcja:')
    print('  - Wpisz literę A, B, C lub D')
    print('  - Wpisz S aby pominąć pytanie')
    print('  - Wpisz Q aby zakończyć\n')
    
    updated = 0
    
    for i, q in enumerate(questions):
        if q.get('correct'):
            continue  # Pomiń już uzupełnione
        
        print(f'\n{"="*70}')
        print(f'Pytanie {i+1}/{len(questions)} (ID: {q["id"]})')
        print(f'{"="*70}')
        print(f'\n{q["question"]}\n')
        
        for letter, text in q['answers'].items():
            print(f'  {letter}. {text}')
        
        while True:
            answer = input('\nPoprawna odpowiedź (A/B/C/D/S/Q): ').strip().upper()
            
            if answer == 'Q':
                print('\n⏹️ Przerywam...')
                return updated
            
            if answer == 'S':
                print('⏭️ Pominięto')
                break
            
            if answer in ['A', 'B', 'C', 'D']:
                q['correct'] = answer
                updated += 1
                print(f'✅ Zapisano: {answer}')
                break
            
            print('❌ Nieprawidłowa odpowiedź. Wpisz A, B, C, D, S lub Q')
    
    return updated

def show_stats(questions):
    """Pokaż statystyki bazy"""
    total = len(questions)
    with_answers = sum(1 for q in questions if q.get('correct'))
    without_answers = total - with_answers
    
    print(f'\n📊 Statystyki bazy danych:')
    print(f'   Wszystkich pytań: {total}')
    print(f'   Z poprawną odpowiedzią: {with_answers} ({with_answers/total*100:.1f}%)')
    print(f'   Bez poprawnej odpowiedzi: {without_answers} ({without_answers/total*100:.1f}%)')
    print()

def main():
    input_file = 'inf04_questions (2).json'
    
    print('🎓 INF.04 - Uzupełnianie poprawnych odpowiedzi')
    print('=' * 70)
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        print(f'✅ Załadowano {len(questions)} pytań z {input_file}\n')
        
        show_stats(questions)
        
        print('Wybierz tryb:')
        print('  1 - Ręczne uzupełnianie')
        print('  2 - Wyświetl statystyki i wyjdź')
        print('  3 - Eksportuj pytania bez odpowiedzi')
        
        choice = input('\nWybór (1/2/3): ').strip()
        
        if choice == '1':
            updated = manual_mode(questions)
            
            if updated > 0:
                # Zapisz zmiany
                with open(input_file, 'w', encoding='utf-8') as f:
                    json.dump(questions, f, ensure_ascii=False, indent=2)
                
                print(f'\n✅ Zaktualizowano {updated} pytań!')
                print(f'💾 Zapisano do: {input_file}')
                print('\n⚠️ WAŻNE: Uruchom ponownie convert_json_to_js.py aby zaktualizować rozszerzenie!')
            else:
                print('\nℹ️ Nie dokonano żadnych zmian')
        
        elif choice == '2':
            print('\n👋 Do zobaczenia!')
        
        elif choice == '3':
            # Eksportuj pytania bez odpowiedzi
            no_answer = [q for q in questions if not q.get('correct')]
            output_file = 'pytania_do_uzupelnienia.txt'
            
            with open(output_file, 'w', encoding='utf-8') as f:
                for q in no_answer:
                    f.write(f'ID: {q["id"]}\n')
                    f.write(f'Pytanie: {q["question"]}\n')
                    for letter, text in q['answers'].items():
                        f.write(f'  {letter}. {text}\n')
                    f.write('\n' + '='*70 + '\n\n')
            
            print(f'\n✅ Wyeksportowano {len(no_answer)} pytań do: {output_file}')
        
        else:
            print('❌ Nieprawidłowy wybór')
    
    except FileNotFoundError:
        print(f'❌ Nie znaleziono pliku: {input_file}')
        sys.exit(1)
    except Exception as e:
        print(f'❌ Błąd: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()

