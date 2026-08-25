"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/paths";

/** PWA service worker'ını yalnızca üretim yapısında kaydeder. */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const swUrl = `${BASE_PATH}/sw.js?v=6`;
    const scope = `${BASE_PATH}/` || "/";
    navigator.serviceWorker.register(swUrl, { scope }).catch(() => {
      // Kayıt başarısız olursa uygulama çevrimiçi olarak çalışmaya devam eder.
    });
  }, []);

  return null;
}
