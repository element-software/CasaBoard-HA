/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";

export interface CasaBoardOgTemplateProps {
  logoBuffer: ArrayBuffer;
  title: string;
  description: string;
}

/** stretch = children span full column width so text-align: center affects every line (alignItems:center shrinks blocks and reads as left-aligned). */
const TEXT_COLUMN_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "center",
  flexShrink: 1,
  minWidth: 0,
  width: 620,
  maxWidth: 620,
  gap: 16,
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 620,
  maxWidth: 620,
  color: "#5b21b6",
  fontSize: 68,
  fontWeight: 900,
  lineHeight: 1.12,
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
  overflowWrap: "anywhere",
  wordBreak: "normal",
};

const DESCRIPTION_STYLE: CSSProperties = {
  margin: 0,
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 620,
  maxWidth: 620,
  color: "#475569",
  fontSize: 25,
  fontWeight: 700,
  lineHeight: 1.45,
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
  overflowWrap: "anywhere",
  wordBreak: "normal",
};

export function CasaBoardOgTemplate({
  logoBuffer,
  description,
  title,
}: CasaBoardOgTemplateProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(ellipse at 78% 18%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 22% 72%, rgba(167, 139, 250, 0.12) 0%, transparent 55%),
          linear-gradient(to bottom, #f5f3ff 0%, #ffffff 100%)
        `,
        padding: 48,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          backgroundSize: "40px 40px",
          backgroundImage: `
          linear-gradient(to right, rgba(226, 232, 240, 0.95) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(226, 232, 240, 0.95) 1px, transparent 1px)`,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <img
          src={`data:image/png;base64,${Buffer.from(logoBuffer).toString("base64")}`}
          style={{
            objectFit: "contain",
            width: 430,
            flexShrink: 0,
          }}
          alt=""
        />
        <div style={TEXT_COLUMN_STYLE}>
          <div style={TITLE_STYLE}>{title}</div>
          <div style={DESCRIPTION_STYLE}>{description}</div>
        </div>
      </div>
    </div>
  );
}
