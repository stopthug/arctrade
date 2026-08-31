import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "ArcTrade — Trade Arc Directly From Telegram";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const brand = await readFile(join(process.cwd(), "public/brand.png"));
  const src = `data:image/png;base64,${brand.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F7F5",
          color: "#0A0A0A",
          padding: 64,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={src} width={40} height={40} style={{ borderRadius: 999 }} alt="" />
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            ArcTrade
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "-0.05em",
              lineHeight: 0.92,
            }}
          >
            Trade Arc.
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "-0.05em",
              lineHeight: 0.92,
            }}
          >
            Directly from Telegram.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 16,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#5F5F5F",
          }}
        >
          <span>Telegram-native trading</span>
          <span>0.5% service fee</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
