"use client";

import { useEffect } from "react";

/** PWA service worker'ını yalnızca üretim yapısında kaydeder. */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Kayıt başarısız olursa uygulama çevrimiçi olarak çalışmaya devam eder.
    });
  }, []);

  return null;
}
