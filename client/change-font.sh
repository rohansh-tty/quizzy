#!/bin/bash

# Font Switcher Script
# Usage: ./change-font.sh [font-name]
# Available fonts: inter, poppins, roboto, openSans, montserrat, nunito

FONT_NAME=${1:-poppins}

# Check if font name is valid
VALID_FONTS=("inter" "poppins" "roboto" "openSans" "montserrat" "nunito")
if [[ ! " ${VALID_FONTS[@]} " =~ " ${FONT_NAME} " ]]; then
    echo "❌ Invalid font name: $FONT_NAME"
    echo "Available fonts: ${VALID_FONTS[*]}"
    exit 1
fi

echo "🔄 Changing font to: $FONT_NAME"

# Update the font configuration file
sed -i "s/const FONT_NAME:.*= '.*'/const FONT_NAME: 'inter' | 'poppins' | 'roboto' | 'openSans' | 'montserrat' | 'nunito' = '$FONT_NAME'/" src/config/fonts.ts

# Update CSS file with new font import
case $FONT_NAME in
    "inter")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Inter'/" src/index.css
        ;;
    "poppins")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Poppins'/" src/index.css
        ;;
    "roboto")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Roboto'/" src/index.css
        ;;
    "openSans")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Open Sans'/" src/index.css
        ;;
    "montserrat")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Montserrat'/" src/index.css
        ;;
    "nunito")
        sed -i "s|@import url('https://fonts.googleapis.com/css2?family=[^']*'|@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap'|" src/index.css
        sed -i "s/--font-primary: '[^']*'/--font-primary: 'Nunito'/" src/index.css
        ;;
esac

echo "✅ Font changed to $FONT_NAME successfully!"
echo "🔄 Restart your development server to see the changes."
echo ""
echo "To change fonts manually, edit: src/config/fonts.ts"
echo "Change this line: const FONT_NAME = '$FONT_NAME'" 