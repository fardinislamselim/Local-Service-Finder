const https = require('https');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzk0NDk2NzAyLCJpYXQiOjE3OTQ0OTMxMDIsImp0aSI6Ijc2MTk3ZjliMWUwMzQwNzQ5YWM5YmYzNTljNzJkNDlhIiwidXNlcl9pZCI6IjUifQ.DCnTOE3q5XNVhUZNekS4w5hoATB_Hf1KSH-OaBAsIfs';

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let body = '';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="gender"\r\n\r\nMALE\r\n';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="phone"\r\n\r\n+8801700000000\r\n';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="city"\r\n\r\nDhaka\r\n';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="area"\r\n\r\nDhanmondi\r\n';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="bio"\r\n\r\nHello World Bio\r\n';
body += '--' + boundary + '\r\nContent-Disposition: form-data; name="experience"\r\n\r\n3\r\n';
body += '--' + boundary + '--\r\n';

const req = https.request('https://local-service-finder-system.onrender.com/api/v1/profiles/modify_profile/', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let resBody = '';
  res.on('data', c => resBody += c);
  res.on('end', () => console.log('Modify Profile (' + res.statusCode + '):', resBody));
});

req.write(body);
req.end();
