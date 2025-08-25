// matches.js

document.addEventListener("DOMContentLoaded", function () {
    const filter = document.getElementById("matchFilter");
    const allSections = document.querySelectorAll(".match-section");
  
    filter.addEventListener("change", () => {
      const selected = filter.value;
  
      allSections.forEach(section => {
        if (selected === "all") {
          section.style.display = "block";
        } else if (section.classList.contains(selected)) {
          section.style.display = "block";
        } else {
          section.style.display = "none";
        }
      });
    });
  });
  