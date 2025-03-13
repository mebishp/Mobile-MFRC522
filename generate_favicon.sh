#!/bin/bash
# You'll need Inkscape and ImageMagick installed
# sudo apt-get install inkscape imagemagick

# Convert SVG to PNG (32x32)
inkscape -w 32 -h 32 favicon.svg -o favicon-32.png

# Convert SVG to PNG (16x16)
inkscape -w 16 -h 16 favicon.svg -o favicon-16.png

# Create ICO file with both sizes
convert favicon-16.png favicon-32.png favicon.ico

# Clean up temporary files
rm favicon-16.png favicon-32.png

echo "Favicon generated successfully!"
