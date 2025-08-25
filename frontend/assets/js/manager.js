document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('schedule-match');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = {
        dateTime: form.dateTime.value,
        location: form.location.value,
        duration: form.duration.value,
        matchType: form.matchType.value,
        maxPlayers: form.maxPlayers.value,
        visibility: form.visibility.value,
        notes: form.notes.value,
      };
  
      try {
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        const result = await response.json();
        if (response.ok) {
          alert('Match scheduled successfully!');
          form.reset();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Submission failed:', error);
        alert('An error occurred while scheduling the match.');
      }
    });
  });
  