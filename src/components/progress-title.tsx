"use client";

import { useEffect } from "react";
import type { ClientStep } from "@/types/handoff";

const stepNumber: Record<ClientStep, number> = {
  details: 1,
  agreement: 2,
  deposit: 3,
  kickoff: 4,
};

export function ProgressTitle({ current }: { current: ClientStep }) {
  useEffect(() => {
    const step = stepNumber[current];
    document.title = `Aeitron AI - Step ${step} of 4`;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#F5F1E8";
    context.fillRect(0, 0, 32, 32);
    context.fillStyle = "#132420";
    context.beginPath();
    context.arc(16, 16, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#F2C94C";
    context.font = "bold 16px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(step), 16, 17);

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = canvas.toDataURL("image/png");
  }, [current]);

  return null;
}
