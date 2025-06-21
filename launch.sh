#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open index.html in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$DIR/index.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$DIR/index.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    start "$DIR/index.html"
else
    echo "Unsupported operating system. Please open index.html manually."
fi 