#!/bin/bash
# Skrypt do pakowania rozszerzenia

echo "📦 Pakowanie rozszerzenia INF.04 Auto Test..."
echo ""

# Nazwa pliku wyjściowego
OUTPUT="inf04cheat_$(date +%Y%m%d_%H%M%S).zip"

# Pliki do spakowania
FILES=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "content.js"
    "questions_db.js"
    "icon16.png"
    "icon48.png"
    "icon128.png"
    "README.md"
    "QUICKSTART.md"
)

echo "📋 Pliki do spakowania:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (brak!)"
    fi
done

echo ""
echo "🗜️  Pakuję..."

# Usuń stary ZIP jeśli istnieje
rm -f "$OUTPUT" 2>/dev/null

# Spakuj
zip -q "$OUTPUT" "${FILES[@]}"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo ""
    echo "✅ Gotowe!"
    echo "📦 Plik: $OUTPUT"
    echo "📊 Rozmiar: $SIZE"
    echo ""
    echo "💡 Możesz teraz wysłać ten plik znajomym"
    echo "   Instrukcja: JAK_UDOSTEPNIC.md"
else
    echo ""
    echo "❌ Błąd podczas pakowania!"
    exit 1
fi

