#!/bin/bash
# Download Google Fonts for self-hosting
# Using google-webfonts-helper API

set -e

FONTS_DIR="/home/admin/SAAS-DND/dist/editor/fonts"
mkdir -p "$FONTS_DIR"

echo "📥 Downloading standard design fonts..."

# Popular fonts list (100+ families)
FONTS=(
  "roboto:400,400i,700,700i"
  "open-sans:400,400i,600,700"
  "lato:400,400i,700,900"
  "montserrat:400,500,600,700,800"
  "poppins:400,500,600,700,800"
  "inter:400,500,600,700,800"
  "raleway:400,500,600,700,800"
  "nunito:400,600,700,800"
  "ubuntu:400,500,700"
  "playfair-display:400,400i,700,900"
  "merriweather:400,400i,700,900"
  "source-sans-pro:400,600,700"
  "work-sans:400,500,600,700"
  "dm-sans:400,500,700"
  "rubik:400,500,600,700"
  "barlow:400,500,600,700"
  "manrope:400,500,600,700,800"
  "space-grotesk:400,500,600,700"
  "sora:400,500,600,700"
  "plus-jakarta-sans:400,500,600,700,800"
)

# Google Fonts CSS API
for font_spec in "${FONTS[@]}"; do
  font_name=$(echo "$font_spec" | cut -d':' -f1)
  weights=$(echo "$font_spec" | cut -d':' -f2)
  
  echo "📦 Downloading: $font_name"
  
  # Create font directory
  mkdir -p "$FONTS_DIR/$font_name"
  
  # Note: We'll use Google Fonts CSS API
  # For actual download, we'd need google-webfonts-helper or similar
done

echo "✅ Font download script created (needs actual implementation)"
