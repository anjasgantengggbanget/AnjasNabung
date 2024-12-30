     const http = require('http');
     const url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`; // Ganti PROJECT_DOMAIN dengan nama proyek Anda

     setInterval(() => {
         http.get(url);
     }, 280000); // 4.7 menit
     ```
     
