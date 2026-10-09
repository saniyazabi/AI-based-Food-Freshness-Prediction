let currentLang = "en-GB";

document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("langSelect");
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const analyseBtn = document.getElementById("analyseBtn");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const resultsCard = document.getElementById("resultsCard");

  // Language Change Listener
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    updateLanguage(currentLang);
  });

  // Image Select Listener
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        previewImg.src = event.target.result;
        imagePreview.classList.remove("hidden");
        analyseBtn.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Mock Analysis Trigger
  analyseBtn.addEventListener("click", () => {
    resultsCard.classList.remove("hidden");
  });

  // Initialize Language
  updateLanguage(currentLang);
});

function updateLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["en-GB"];

  // Toggle RTL layout for Urdu
  document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";

  // Translate all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (dict[key]) {
      element.textContent = dict[key];
    }
  });
}