document.addEventListener("DOMContentLoaded", function () {
    const userRole = getUserRole(); // Simulated function
  
    const managerSection = document.getElementById("spaceManagerSettings");
    const playerSection = document.getElementById("playerSettings");
  
    if (userRole === "manager") {
      managerSection.style.display = "block";
    } else if (userRole === "player") {
      playerSection.style.display = "block";
    }
  
    document.getElementById("saveSettings").addEventListener("click", function () {
      // Grab values
      const username = document.getElementById("username").value;
      const position = document.getElementById("position").value;
      const emailNotif = document.getElementById("emailNotif").checked;
      const smsNotif = document.getElementById("smsNotif").checked;
      const autoAvailability = document.getElementById("autoAvailability")?.checked || false;
      const pitchName = document.getElementById("pitchName")?.value || "";
      const groupVisibility = document.getElementById("groupVisibility")?.value || "";
  
      // Simulate saving
      const settings = {
        username,
        position,
        emailNotif,
        smsNotif,
        autoAvailability,
        pitchName,
        groupVisibility
      };
  
      console.log("Saving settings:", settings);
      alert("Settings saved successfully!");
    });
  });
  
  function getUserRole() {
    // Simulate role check — replace with backend logic or auth role
    return "manager"; // or "player"
  }
  
  function logout() {
    alert("Logging out...");
    // Add your logout logic here
    window.location.href = "index.html";
  }
  