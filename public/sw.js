// public/sw.js
self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "ipixchat";
    const targetUrl = data.url || "/chat?focus=1";
    const options = {
      body: data.body || "Pesan baru masuk!",
      icon: data.icon || "/icon.png",
      badge: "/icon.png",
      vibrate: [200, 100, 200],
      tag: "ipix-chat-new",
      renotify: true,
      data: {
        url: targetUrl,
      },
      actions: [{ action: "reply", title: "Balas" }],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error handling push event:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/chat?focus=1";
  const finalUrl = new URL(targetUrl, self.location.origin).toString();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && clientUrl.pathname.includes("/chat")) {
          return client.navigate(finalUrl).then(() => client.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
      return Promise.resolve();
    })
  );
});