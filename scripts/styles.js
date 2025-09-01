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

// Get dark mode preference from session storage
function isDarkMode() {
  const darkMode = sessionStorage.getItem("isDarkMode");
  return darkMode === "true";
}

// Set dark mode preference in session storage
function setDarkMode(darkMode) {
  sessionStorage.setItem("isDarkMode", darkMode.toString());
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

// Get the base style name (without Light/Dark suffix)
function getBaseStyleName() {
  const currentStyleName = getCurrentStyleName();
  if (!currentStyleName) return null;

  if (currentStyleName.endsWith(" Dark")) {
    return currentStyleName.replace(" Dark", "");
  } else if (currentStyleName.endsWith(" Light")) {
    return currentStyleName.replace(" Light", "");
  }
  return currentStyleName;
}

// Get the appropriate style name based on current base style and dark mode setting
function getTargetStyleName() {
  const baseStyleName = getBaseStyleName();
  if (!baseStyleName) return null;

  const darkModeEnabled = isDarkMode();
  const targetStyleName = darkModeEnabled
    ? `${baseStyleName} Dark`
    : `${baseStyleName} Light`;

  const availableStyles = getAvailableStyleNames();
  return availableStyles.includes(targetStyleName) ? targetStyleName : null;
}

// Get unique base style names (without Light/Dark suffixes)
function getUniqueBaseStyles() {
  const styleNames = getAvailableStyleNames();
  const baseStyles = new Set();

  styleNames.forEach((styleName) => {
    if (styleName.endsWith(" Dark")) {
      baseStyles.add(styleName.replace(" Dark", ""));
    } else if (styleName.endsWith(" Light")) {
      baseStyles.add(styleName.replace(" Light", ""));
    } else {
      baseStyles.add(styleName);
    }
  });

  return Array.from(baseStyles);
}

// Get the preferred style name for a base style based on current theme preference
function getPreferredStyleForBase(baseStyleName) {
  const availableStyles = getAvailableStyleNames();
  const darkModeEnabled = isDarkMode();

  // Check if theme variants exist for this base style
  const darkVariant = `${baseStyleName} Dark`;
  const lightVariant = `${baseStyleName} Light`;

  const hasDarkVariant = availableStyles.includes(darkVariant);
  const hasLightVariant = availableStyles.includes(lightVariant);

  if (hasDarkVariant && hasLightVariant) {
    // Both variants exist, choose based on preference
    return darkModeEnabled ? darkVariant : lightVariant;
  } else if (hasDarkVariant) {
    // Only dark variant exists
    return darkVariant;
  } else if (hasLightVariant) {
    // Only light variant exists
    return lightVariant;
  } else {
    // No theme variants, return base style
    return baseStyleName;
  }
}

// Switch to next available style (skipping opposite theme variants)
function switchStyle() {
  const stylesDict = getStylesFromSession();
  const baseStyles = getUniqueBaseStyles();

  if (baseStyles.length === 0) return;

  const currentBaseStyle = getBaseStyleName();
  const currentIndex = baseStyles.indexOf(currentBaseStyle);
  const nextIndex = (currentIndex + 1) % baseStyles.length;
  const nextBaseStyle = baseStyles[nextIndex];

  // Get the preferred style name for the next base style
  const nextStyleName = getPreferredStyleForBase(nextBaseStyle);

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

    // Update dark mode preference based on the new style
    if (nextStyleName.endsWith(" Dark")) {
      setDarkMode(true);
    } else if (nextStyleName.endsWith(" Light")) {
      setDarkMode(false);
    }

    // Re-evaluate theme button visibility after style change
    updateThemeButtonVisibility();

    // Update theme button image after style change
    updateThemeButtonImage();

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

    // Check if we should apply theme preference instead of exact current style
    const currentStyleName = getCurrentStyleName();
    if (
      currentStyleName &&
      (currentStyleName.endsWith(" Dark") ||
        currentStyleName.endsWith(" Light"))
    ) {
      // Initialize dark mode preference if not set
      if (sessionStorage.getItem("isDarkMode") === null) {
        setDarkMode(currentStyleName.endsWith(" Dark"));
      }

      // Apply theme based on preference, which might be different from stored style
      applyThemeBasedOnPreference();
    } else {
      // Apply the current style as-is (for styles without Light/Dark variants)
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = currentStylePath;
      link.setAttribute("data-style-switcher", "true");
      document.head.appendChild(link);

      console.log(`Applied current style: ${currentStylePath}`);
    }
  }
}

// Check if current style has a corresponding Light/Dark counterpart
function hasThemeCounterpart() {
  const currentStyleName = getCurrentStyleName();
  if (!currentStyleName) return false;

  const availableStyles = getAvailableStyleNames();

  if (currentStyleName.endsWith(" Dark")) {
    const lightStyleName = currentStyleName.replace(" Dark", " Light");
    return availableStyles.includes(lightStyleName);
  } else if (currentStyleName.endsWith(" Light")) {
    const darkStyleName = currentStyleName.replace(" Light", " Dark");
    return availableStyles.includes(darkStyleName);
  }

  return false;
}

// Switch between Light and Dark theme variants of current style
function switchTheme() {
  const currentStyleName = getCurrentStyleName();
  if (!currentStyleName) return;

  // Toggle dark mode setting
  const currentDarkMode = isDarkMode();
  setDarkMode(!currentDarkMode);

  // Apply the appropriate theme based on the new setting
  applyThemeBasedOnPreference();
}

// Apply theme based on current dark mode preference
function applyThemeBasedOnPreference() {
  const targetStyleName = getTargetStyleName();
  if (!targetStyleName) {
    console.log("No matching theme available for current preference");
    return;
  }

  // Apply the target style
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

    // Update theme button image after applying new theme
    updateThemeButtonImage();

    const darkModeEnabled = isDarkMode();
    console.log(
      `Applied ${darkModeEnabled ? "dark" : "light"} theme: "${targetStyleName}"`,
    );
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
      // Update image when button becomes visible
      updateThemeButtonImage();
    }
  } else {
    // Hide button if it exists
    if (themeButton) {
      themeButton.style.display = "none";
    }
  }
}

// Update theme button image based on current theme
function updateThemeButtonImage() {
  const themeButton = document.getElementById("theme-btn");
  if (!themeButton) return;

  const themeImg = themeButton.querySelector("img");
  if (!themeImg) return;

  const darkModeEnabled = isDarkMode();
  // Show moon for light theme (clicking switches to dark)
  // Show sun for dark theme (clicking switches to light)
  themeImg.src = darkModeEnabled ? "styles/sun.png" : "styles/moon.png";
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

  const themeImg = document.createElement("img");
  themeImg.src = isDarkMode() ? "styles/sun.png" : "styles/moon.png";
  themeImg.style.objectFit = "contain";
  themeButton.appendChild(themeImg);

  // Set initial image based on current theme
  updateThemeButtonImage();

  // Set initial visibility based on current style
  themeButton.style.display = hasThemeCounterpart() ? "block" : "none";

  // Add theme switching functionality
  themeButton.onclick = function () {
    switchTheme();
    // Update image after theme switch
    updateThemeButtonImage();
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
