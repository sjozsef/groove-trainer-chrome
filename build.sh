#!/bin/bash

# This script packages the Chrome extension into a zip file for the Chrome Web Store.

# Define the build directory and the name of the zip file.
BUILD_DIR="build"
ZIP_NAME="groove-trainer.zip"
ZIP_PATH="$BUILD_DIR/$ZIP_NAME"

# Create the build directory if it doesn't exist, and clear it.
mkdir -p $BUILD_DIR
rm -f $BUILD_DIR/*

# Create the zip file, excluding development and unnecessary files.
# The '.' at the end means "zip the current directory".
zip -r $ZIP_PATH . -x \
    ".git/*" \
    ".aider*" \
    "build.sh" \
    "cover.svg" \
    "$BUILD_DIR/*" \
    ".gitignore" \
    "README.md" \
    "images/icon.svg" \
    "**/.DS_Store"

echo "Extension packaged successfully: $ZIP_PATH"
