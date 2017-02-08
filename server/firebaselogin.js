var admin = require("firebase-admin");

var serviceAccount = {
  "type": "service_account",
  "project_id": "ctf-multi-player",
  "private_key_id": "973a238136681e28b4729ac81ef7f3baf16ab9cf",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCpBNvuppepnbYZ\nu+TjUilozGsHzynPJwhl+4htdkUxR1QxgXHPf++pDOE1IwvngI/Gjts3X1nDC4mv\nfyszWnQbhnAcfnIbso2ysblw0G5ps+UqMdAlzT+LZcqrBfNvyQOjTTt3jaLJ4pIZ\nV4B/iW/zrMvjo4EXlzuWNM1LTZtZ24vh2vXr8VesM5SYJhwX2IlXVuTH+Z4P5SdQ\n2SVOLOzomu0vZBekDesF2rk5Mj21me5R77NuEVoG2TaWIr8uQxA6tl+5nkJt6kt/\nrMJSJgJTXmVDeAZX1F5Nwk6zFfNaBdO//jqO9xpG99Zbys/uRgnHQRpSuWTvJbVm\np2EAsN+NAgMBAAECggEAA8fiC5KabebjPewgEJ2z424/LquJqeKbo3xe7uPoZFPO\nJFVa8GNSPxvUpdWk3IbZsH1dlf2CCoTljZFwq/NoCX2WYGzLrKbv2IF1PnrLHX4y\nsCDxIQdYVovuXqkBawy6EhsWK3R1ocJ5tito6nFumarR3MO5jYeKg6+mr/qKcRYY\n2MbkwoPPTPrqM+Z1Fsil0x9jTBMH0fzFt03N9HYrT/DvRReicwwKGFRu/WzgX/hX\nbipPirfx4zzkF9WJfnUeY3N+cYUkK7FdIQ7zMc59ZxViTpa9T/Oi/o3N339p7okM\nVkzFH7bgbG0yAPOMJJHfV8OkRgHgPK5TQi/ZxIh6WQKBgQDYOaWend4+BUaqRqHK\nE7SjfD/JxGSa0TSC0oIAbdWio7ti0AQnpriP/edyoI4pP/dN8qCsFbiZjTKkAfS9\nk3LdKYjFWmuLTrlYjEGB2cHOQmadgoZMxabGO1sNW/P5SUjgpHV9Yl/GzThJI/Ii\nJFuVadJJQ3tEJd3jZgasVeWs8wKBgQDIHDRfyk7apjB2kw9/jReRYKQhC46+nTuy\nGdcZTfvTgUASOdjbnTRToeCI+nREghVI+Kytweji2ClPDAlzz3FntExa+wk1Z5Ey\nyjGU20jAMJy7iOGtOgBgKJ2p405uX9i8vQscFePJpMXDU4P4KI9QzhGPdj7IrZd1\ntgs8G+hhfwKBgQCSucuhbw84luv08Ckpr2WM6ut+Rz7dr8kqXR7Km720t9aYnv+y\nyHfFfk5ognr1kuqGgnZ1T+gMirwqfwlM+5meamjdQxZnWex8IfDx5IqXJIftqnzn\n69fX/L80uYk9SHWjuvXfN7o2dVwUhcfxUyqyoTSJcrla7Tc88CbnGwLX8QKBgENT\nAefsZ6U2Xn22MnOmY3R8wBuCCO9mdOwRt4WC8COTi5vWLHiOpkkw4BsVsEJQRZr8\nVxRKdfDD6vn2QcPd2fia90lwxgNaqcYdspqzQAGxGToa7lpadj/jyk+a8ws9Yez1\n6SP01WNE9Wgm0/KMqtLz0YKjtLHNfXST36nEdeU/AoGBALz6o7FZ4L3VTwsXj4MO\nfziZmQ7WksfyOZhmp6go1MzoAI2qqAFeLmWXTDsqj0UfHZ9/iRFm6ut8leZj9Plc\n7fYDbPpQJbXZM130HIdgajwFMqYkcJs8X/qnBBynllXztpNIkH+v2DL2bBVMHc4w\nqrKuvbKlBfdoxxVuG7PCz051\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-hooke@ctf-multi-player.iam.gserviceaccount.com",
  "client_id": "115814825682628794094",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hooke%40ctf-multi-player.iam.gserviceaccount.com"
}

var app = admin.initializeApp({
  credential:  admin.credential.cert(serviceAccount),
  databaseURL: "https://ctf-multi-player.firebaseio.com/"
});

module.exports = app;
