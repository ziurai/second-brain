#!/bin/bash
# One-time setup: installs OpenLocal.app and registers the openlocal:// URL scheme.
# Run this once on your Mac, then openlocal:// links from the dashboard will work.

set -e

APP_DIR="$HOME/Applications"
APP_PATH="$APP_DIR/OpenLocal.app"

mkdir -p "$APP_DIR"

echo "Building OpenLocal.app..."

# Write the AppleScript handler to a temp file
TMP=$(mktemp /tmp/openlocal.XXXXXX.applescript)
cat > "$TMP" << 'APPLESCRIPT'
on open location theURL
    -- Strip "openlocal://" (12 chars) to get the file path
    set filePath to text 13 thru -1 of theURL
    do shell script "open " & quoted form of ("file://" & filePath)
end open location
APPLESCRIPT

# Remove old version if it exists
rm -rf "$APP_PATH"

# Compile AppleScript into an app bundle
osacompile -o "$APP_PATH" "$TMP"
rm "$TMP"

# Register the openlocal:// URL scheme in the app's Info.plist
/usr/libexec/PlistBuddy \
  -c "Add :CFBundleURLTypes array" \
  -c "Add :CFBundleURLTypes:0 dict" \
  -c "Add :CFBundleURLTypes:0:CFBundleURLName string com.secondbrain.openlocal" \
  -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" \
  -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string openlocal" \
  "$APP_PATH/Contents/Info.plist"

# Tell macOS about the new URL scheme
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_PATH"

echo ""
echo "Done! OpenLocal.app installed to ~/Applications/"
echo ""
echo "Run this once to initialize it (macOS will ask you to confirm — click Open):"
echo ""
echo "  open \"$APP_PATH\""
echo ""
echo "After that, clicking file links on your dashboard will open them directly."
