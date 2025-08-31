// Gets the styles dictionary from session storage
function getStylesFromSession() {
  const stylesJson = sessionStorage.getItem("stylesDict");
  return stylesJson ? JSON.parse(stylesJson) : {};
}

// Gets a style path by its name from session storage
function getStylePath(styleName) {
  const stylesDict = getStylesFromSession();
  return stylesDict[styleName] || null;
}

// Gets all available style names from session storage
function getAvailableStyleNames() {
  const stylesDict = getStylesFromSession();
  return Object.keys(stylesDict);
}

// Save current style to session storage (stores the file path)
function saveCurrentStyle(stylePath) {
  sessionStorage.setItem("style", stylePath);
}

// Get current style from session storage (returns the file path)
function getCurrentStyle() {
  return sessionStorage.getItem("style");
}

// Get current style name from session storage
function getCurrentStyleName() {
  const currentStylePath = getCurrentStyle();
  if (!currentStylePath) return null;

  const stylesDict = getStylesFromSession();
  // Find the style name that corresponds to the current path
  for (const [styleName, stylePath] of Object.entries(stylesDict)) {
    if (stylePath === currentStylePath) {
      return styleName;
    }
  }
  return null;
}

// Switch to next available style
function switchStyle() {
  const stylesDict = getStylesFromSession();
  const styleNames = getAvailableStyleNames();

  if (styleNames.length === 0) return;

  const currentStyleName = getCurrentStyleName();
  const currentIndex = styleNames.indexOf(currentStyleName);
  const nextIndex = (currentIndex + 1) % styleNames.length;
  const nextStyleName = styleNames[nextIndex];

  // Apply the new style
  const existingLinks = document.querySelectorAll("link[data-style-switcher]");
  existingLinks.forEach((link) => link.remove());

  const stylePath = getStylePath(nextStyleName);
  if (stylePath) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylePath;
    link.setAttribute("data-style-switcher", "true");
    document.head.appendChild(link);

    // Save the new current style (save the path, not the name)
    saveCurrentStyle(stylePath);

    // Re-evaluate theme button visibility after style change
    updateThemeButtonVisibility();

    console.log(`Switched to style: ${nextStyleName} (${stylePath})`);
  }
}

// Apply the current style from session storage
function applyCurrentStyle() {
  const currentStylePath = getCurrentStyle();
  if (currentStylePath) {
    // Remove any existing style switcher links
    const existingLinks = document.querySelectorAll(
      "link[data-style-switcher]",
    );
    existingLinks.forEach((link) => link.remove());

    // Apply the current style
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = currentStylePath;
    link.setAttribute("data-style-switcher", "true");
    document.head.appendChild(link);

    console.log(`Applied current style: ${currentStylePath}`);
  }
}

// Check if current style has a corresponding Light/Dark counterpart
function hasThemeCounterpart() {
  const currentStyleName = getCurrentStyleName();
  if (!currentStyleName) return false;

  const availableStyles = getAvailableStyleNames();
  
  if (currentStyleName.endsWith(' Dark')) {
    const lightStyleName = currentStyleName.replace(' Dark', ' Light');
    return availableStyles.includes(lightStyleName);
  } else if (currentStyleName.endsWith(' Light')) {
    const darkStyleName = currentStyleName.replace(' Light', ' Dark');
    return availableStyles.includes(darkStyleName);
  }
  
  return false;
}

// Switch between Light and Dark theme variants of current style
function switchTheme() {
  const currentStyleName = getCurrentStyleName();
  if (!currentStyleName) return;

  let targetStyleName;
  
  if (currentStyleName.endsWith(' Dark')) {
    targetStyleName = currentStyleName.replace(' Dark', ' Light');
  } else if (currentStyleName.endsWith(' Light')) {
    targetStyleName = currentStyleName.replace(' Light', ' Dark');
  } else {
    // Current style doesn't have Light/Dark suffix, can't switch
    return;
  }

  const availableStyles = getAvailableStyleNames();
  if (!availableStyles.includes(targetStyleName)) {
    console.log(`Target theme "${targetStyleName}" not available`);
    return;
  }

  // Apply the theme counterpart
  const existingLinks = document.querySelectorAll("link[data-style-switcher]");
  existingLinks.forEach((link) => link.remove());

  const stylePath = getStylePath(targetStyleName);
  if (stylePath) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylePath;
    link.setAttribute("data-style-switcher", "true");
    document.head.appendChild(link);

    // Save the new current style
    saveCurrentStyle(stylePath);

    console.log(`Switched theme from "${currentStyleName}" to "${targetStyleName}"`);
  }
}

// Update theme button visibility based on current style
function updateThemeButtonVisibility() {
  const themeButton = document.getElementById("theme-btn");
  
  if (hasThemeCounterpart()) {
    // Show button if it doesn't exist, create it
    if (!themeButton) {
      createThemeButton();
    } else {
      themeButton.style.display = "block";
    }
  } else {
    // Hide button if it exists
    if (themeButton) {
      themeButton.style.display = "none";
    }
  }
}

// Create theme switch button that toggles between Light and Dark
function createThemeButton() {
  // Check if button already exists to avoid duplicates
  if (document.getElementById("theme-btn")) {
    return;
  }

  const themeButton = document.createElement("button");
  themeButton.id = "theme-btn";
  themeButton.className = "theme-btn small-btn";
  themeButton.textContent = "THEME";

  // Set initial visibility based on current style
  themeButton.style.display = hasThemeCounterpart() ? "block" : "none";

  // Add theme switching functionality
  themeButton.onclick = function () {
    switchTheme();
  };

  document.body.appendChild(themeButton);
}

// Create style switch button similar to back button
function createStyleButton() {
  // Check if button already exists to avoid duplicates
  if (document.getElementById("style-btn")) {
    return;
  }

  const styleButton = document.createElement("button");
  styleButton.id = "style-btn";
  styleButton.className = "style-btn small-btn";
  styleButton.textContent = "STYLE";

  styleButton.onclick = function () {
    switchStyle();
  };

  document.body.appendChild(styleButton);
}

// Apply current style and create buttons when the DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    applyCurrentStyle();
    createStyleButton();
    createThemeButton();
  });
} else {
  applyCurrentStyle();
  createStyleButton();
  createThemeButton();
}
