     const token = '7660856384:AAHQuKHv8XcCSqmDoSaNsjS6X_HtjCquD3M';
     const chatId = '7562559526';

     function addSaving() {
         const amount = parseInt(document.getElementById('amount').value);
         const source = document.getElementById('source').value;
         if (amount < 20000) {
             alert('Minimal jumlah nabung adalah 20000');
             return;
         }
         fetch('/add-saving', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({ amount: amount, source: source })
         })
         .then(response => response.text())
         .then(data => {
             alert(data);
             updateSummary();
         })
         .catch(error => {
             console.error('Error:', error);
             alert('Terjadi kesalanta saat menyimpan data');
         });
     }

     function updateSummary() {
         fetch('/summary')
         .then(response => response.text())
         .then(data => {
             document.getElementById('summary').innerHTML = data;
         })
         .catch(error => {
             console.error('Error:', error);
             alert('Terjadi kesalahan saat memuat ringkasan');
         });
     }

     document.addEventListener('DOMContentLoaded', () => {
         updateSummary();
     });
     ```
     
