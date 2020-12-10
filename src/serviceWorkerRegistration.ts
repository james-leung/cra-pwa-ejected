// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};
export function addEventListeners() {
  console.log("Adding event listeners");
  function receivePushNotification(event: any) {
    console.log("Push notification received.");
  }
  window.addEventListener("load", () => console.log("Page loaded."));
  // eslint-disable-next-line
  self.addEventListener("fetch", () => console.log("Fetch event detected."));

  // Should trigger when push notification is received
  window.addEventListener("push", receivePushNotification);
}

function saveSubToBrowser(sub: PushSubscription | null) {
  if (sub) {
    console.log("Saving subscription details to browser");
    console.log(sub.endpoint);
    console.log(sub.getKey("p256dh"));
    console.log(sub.getKey("auth"));

    window.localStorage.setItem("endpoint", sub.endpoint);
    window.localStorage.setItem(
      "p256dh",
      arrayBufferToBase64(sub.getKey("p256dh"))
    );
    window.localStorage.setItem(
      "auth",
      arrayBufferToBase64(sub.getKey("auth"))
    );
  }
}

export function getSubscription(reg: ServiceWorkerRegistration) {
  reg.pushManager
    .getSubscription()
    .then(function (sub: PushSubscription | null) {
      if (sub === null) {
        console.log("Subscribing to push notifications.");
        reg.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              "BKH2NyNHKoYYEIXhgHn64H3YG-xRW3XIwr06c8EMhx_j-_00zPa0cTyXv0ksh8ETF1hUoD8GnZmMilcDgJYF8Ps",
          })
          .then(function (sub: any) {
            saveSubToBrowser(sub);
            return;
          })
          .catch(function (err: string) {
            console.error("Unable to subscribe to push", err);
          });
      } else {
        saveSubToBrowser(sub);
        return;
      }
    });
}

export function register(config?: Config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    console.log(`In production mode, service worker supported by browser`);
    // if ("serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://bit.ly/CRA-PWA"
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function arrayBufferToBase64(buffer: any) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      const serviceWorker =
        registration.installing || registration.waiting || registration.active;
      if (serviceWorker?.state === "activated") {
        console.log("already active");
        console.log(`Notification permission: ${Notification.permission}`);
        addEventListeners();

        getSubscription(registration);
      } else {
        serviceWorker?.addEventListener("statechange", (event) => {
          if ((event.target as any)?.state === "activated") {
            console.log("later active");
            console.log(`Notification permission: ${Notification.permission}`);
            addEventListeners();
            getSubscription(registration);
          }
        });
      }
      // if (Notification.permission === "granted") {
      //   getSubscription(registration);
      // } else if (Notification.permission === "denied") {
      //   // Update UI
      // } else {
      //   // Update UI
      // }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                "New content is available and will be used when all " +
                  "tabs for this page are closed. See https://bit.ly/CRA-PWA."
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log("Content is cached for offline use.");

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        // Or, content type does not include javascript (e.g. since server returns
        // html page)
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
