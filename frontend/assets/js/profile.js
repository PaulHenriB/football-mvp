// profile.js

function toggleEdit() {
    const form = document.getElementById('editForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
  
  function saveProfile() {
    const nameInput = document.getElementById('nameInput').value;
    const positionInput = document.getElementById('positionInput').value;
    const avatarInput = document.getElementById('avatarInput').files[0];
  
    if (nameInput) {
      document.getElementById('userName').textContent = nameInput;
    }
  
    if (positionInput) {
      document.getElementById('favPosition').textContent = positionInput;
    }
  
    if (avatarInput) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('avatarPreview').src = e.target.result;
      };
      reader.readAsDataURL(avatarInput);
    }
  
    toggleEdit();
  }
  