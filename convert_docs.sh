#!/bin/bash
# convert_docs.sh

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Define directories
SOURCE_DIR="$SCRIPT_DIR/docs"
HTML_OUTPUT_DIR="$SCRIPT_DIR/sydocapp/public/docs_html"
RAW_OUTPUT_DIR="$SCRIPT_DIR/sydocapp/public/docs_raw"

# Create output directories if they don't exist
mkdir -p "$HTML_OUTPUT_DIR"
mkdir -p "$RAW_OUTPUT_DIR"

# Process each supported file
find "$SOURCE_DIR" -type f \( -iname "*.doc" -o -iname "*.docx" -o -iname "*.ppt" -o -iname "*.pdf" \) | while read -r file; do
  # Compute relative path and remove file extension for HTML output file
  REL_PATH="${file#$SOURCE_DIR/}"
  BASE_REL="${REL_PATH%.*}"
  
  # Define destination paths
  DEST_HTML="$HTML_OUTPUT_DIR/${BASE_REL}.html"
  DEST_RAW="$RAW_OUTPUT_DIR/$REL_PATH"
  
  # Ensure output directories exist
  mkdir -p "$(dirname "$DEST_HTML")"
  mkdir -p "$(dirname "$DEST_RAW")"
  
  # Determine file extension (lowercase)
  ext="${file##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  
  if [ "$ext" = "pdf" ]; then
    echo "Processing PDF file: $file"
    # Directly use pdftohtml for PDF conversion.
    DEST_BASE="${DEST_HTML%.*}"
    echo "Running pdftohtml on $file with base $DEST_BASE"
    pdftohtml -c -nodrm -enc UTF-8 -fmt png -noframes "$file" "$DEST_BASE"
    
    # At this point pdftohtml creates:
    #   - ${DEST_BASE}.html   (the main HTML file)
    #   - ${DEST_BASE}_images/  (folder with images)
    #
    # Move images from the auto-generated folder into ./img/ subdirectory.
    # DEST_FOLDER="$(dirname "$DEST_HTML")"
    # IMG_FOLDER="$DEST_FOLDER/img"
    # mkdir -p "$IMG_FOLDER"
    # if [ -d "${DEST_BASE}_images" ]; then
    #   echo "Moving images from ${DEST_BASE}_images to $IMG_FOLDER"
    #   mv "${DEST_BASE}_images"/* "$IMG_FOLDER"/ 2>/dev/null
    #   rm -rf "${DEST_BASE}_images"
    # fi
    
    # Now call the Python script to update image paths in the main HTML file.
    # html_file="${DEST_BASE}.html"
    # echo "Calling update_html.py on $html_file"
    # /usr/bin/env python3 "$SCRIPT_DIR/update_html.py" "$html_file"
    
    # # Optionally, move the HTML file to DEST_HTML if its name differs.
    # if [ "$html_file" != "$DEST_HTML" ]; then
    #   mv "$html_file" "$DEST_HTML"
    # fi
  else
    echo "Processing DOC/DOCX/PPT file: $file"
    # For DOC, DOCX, and PPT, use LibreOffice to convert to HTML.
    DEST_FOLDER="$(dirname "$DEST_HTML")"
    mkdir -p "$DEST_FOLDER"
    echo "Running LibreOffice conversion on $file"
    /Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to html --outdir "$DEST_FOLDER" "$file"
    
    # The generated HTML file name is the same as the source file name with .html extension.
    html_file="$DEST_FOLDER/$(basename "$file" | sed 's/\.[^.]*$/.html/')"
    
    # Create an img subfolder and move any generated image files into it.
    # IMG_FOLDER="$DEST_FOLDER/img"
    # mkdir -p "$IMG_FOLDER"
    # echo "Moving images from $DEST_FOLDER to $IMG_FOLDER"
    # mv "$DEST_FOLDER"/*.jpg "$IMG_FOLDER/" 2>/dev/null
    # mv "$DEST_FOLDER"/*.png "$IMG_FOLDER/" 2>/dev/null
    
    # Call the Python script to update image paths in the HTML file.
    # echo "Calling update_html.py on $html_file"
    # /usr/bin/env python3 "$SCRIPT_DIR/update_html.py" "$html_file"
    
    # # Optionally, move the HTML file to DEST_HTML if needed.
    # if [ "$html_file" != "$DEST_HTML" ]; then
    #   mv "$html_file" "$DEST_HTML"
    # fi
  fi
  
  # Copy the raw file to the raw output directory.
  cp "$file" "$DEST_RAW"
done
