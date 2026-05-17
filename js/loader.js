function updateThemeIcon() {
  const themeIcon = document.querySelector("#theme-toggle .icon");
  if (!themeIcon) return;

  const isDark = document.body.classList.contains("dark");
  themeIcon.textContent = isDark ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", function() {
  // Determine correct base path depending on current page location
  const basePath = window.location.pathname.includes('/pages/') ? '../' : './';

  // Load Header
  fetch(basePath + 'Components/header.html')
    .then(response => response.text())
    .then(data => {
      // Fix relative paths in the loaded HTML based on the current page's depth
      document.getElementById('header').innerHTML = data.replace(/\.\.\//g, basePath);
      
      // Initialize hamburger menu after header loads
      const hamburger = document.getElementById('hamburger');
      const navbar = document.getElementById('navbar');
      if(hamburger && navbar) {
        hamburger.addEventListener('click', () => {
          hamburger.classList.toggle('active');
          navbar.classList.toggle('active');
        });
      }

      updateThemeIcon();
    })
    .catch(error => console.error('Error loading header:', error));

  // Load Footer
  fetch(basePath + 'Components/footer.html')
    .then(response => response.text())
    .then(data => {
      // Fix relative paths in the loaded HTML based on the current page's depth
      document.getElementById('footer').innerHTML = data.replace(/\.\.\//g, basePath);
    })
    .catch(error => console.error('Error loading footer:', error));
});

// Event delegation for dynamically loaded button
document.addEventListener("click", function(e) {
  if (e.target.closest("#theme-toggle")) {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }

    updateThemeIcon();
  }
});

// Initialize theme on load
window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.setAttribute("data-theme", "light");
  }

  updateThemeIcon();
});
