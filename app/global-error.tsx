"use client";

import { useEffect } from "react";

/**
 * Son çare hata sınırı.
 *
 * Kök layout'un kendisi çökerse `app/error.tsx` devreye giremez; Next bu
 * durumda global-error'u kendi <html>/<body> ağacıyla render eder. Bu yüzden
 * burada proje bileşenleri ve global stiller kullanılmaz, satır içi stil
 * yazılır — layout çalışmadığı için Tailwind sınıflarına güvenilemez.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SafeWatch global error:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#F4F6F8",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#263238",
        }}
      >
        <div
          style={{
            maxWidth: "26rem",
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #E0E4E7",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#607D8B",
            }}
          >
            SafeWatch
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "20px", fontWeight: 700 }}>
            Uygulama yüklenemedi
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#607D8B",
            }}
          >
            Beklenmeyen bir sorun oluştu. İlerlemeniz bu cihazda saklıdır ve
            kaybolmamıştır.
          </p>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#E1251B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tekrar Dene
            </button>
            {/* next/link kullanilmaz: kok layout coktugu icin router'a guvenilmez. */}
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                background: "#FFFFFF",
                color: "#263238",
                border: "1px solid #E0E4E7",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ana Menü
            </button>
          </div>
          {error.digest && (
            <p
              style={{
                margin: "20px 0 0",
                paddingTop: "16px",
                borderTop: "1px solid #E0E4E7",
                fontSize: "11px",
                lineHeight: 1.5,
                color: "#607D8B",
                wordBreak: "break-all",
              }}
            >
              Hata kodu: <span style={{ fontFamily: "monospace" }}>{error.digest}</span>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
