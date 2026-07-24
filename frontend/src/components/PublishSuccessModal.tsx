import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  shortLink: string;
  qrDataUrl: string;
  formTitle: string;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  wifiQrDataUrl?: string | null;
}

export function PublishSuccessModal({
  open,
  onClose,
  shortLink,
  qrDataUrl,
  formTitle,
  wifiSsid,
  wifiPassword,
  wifiQrDataUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ) {
    const lines: string[] = [];
    let currentLine = "";

    for (const char of text) {
      const nextLine = currentLine + char;
      if (ctx.measureText(nextLine).width > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          lines.push(char);
          currentLine = "";
        }
      } else {
        currentLine = nextLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function downloadQr() {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const width = 900;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const qrSize = 620;
      const qrX = (width - qrSize) / 2;
      const qrY = 70;
      ctx.drawImage(image, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("Registration Link", width / 2, qrY + qrSize + 70);

      ctx.font = "24px sans-serif";
      const lines = wrapText(ctx, shortLink, 700);
      const lineHeight = 34;
      const startY = qrY + qrSize + 110;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formTitle.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.src = qrDataUrl;
  }

  // Separate from downloadQr() above on purpose — this is a different image
  // (different headline, different caption, different filename) for a
  // different audience standing at the same table. The existing form-QR
  // download above is untouched.
  function downloadWifiQr() {
    if (!wifiQrDataUrl) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const width = 900;
      const height = 1150;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#b91c1c";
      ctx.textAlign = "center";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("If you do not have data, scan this", width / 2, 60);

      const qrSize = 620;
      const qrX = (width - qrSize) / 2;
      const qrY = 100;
      ctx.drawImage(image, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("Join Wi-Fi", width / 2, qrY + qrSize + 60);

      ctx.font = "24px sans-serif";
      const label = wifiSsid ? `Network: ${wifiSsid}` : "";
      ctx.fillText(label, width / 2, qrY + qrSize + 100);
      if (wifiPassword) {
        ctx.fillText(
          `Password: ${wifiPassword}`,
          width / 2,
          qrY + qrSize + 134,
        );
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formTitle.replace(/\s+/g, "-").toLowerCase()}-wifi-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.src = wifiQrDataUrl;
  }

  return (
    <Modal open={open} onClose={onClose} title="Form Published!">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-scale-in rounded-2xl border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-700 dark:bg-brand-dark-900">
          <img
            src={qrDataUrl}
            alt="Registration QR code"
            className="h-48 w-48"
          />
        </div>

        <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
          Print this QR code for attendees to scan. If scanning fails, they can
          type the link below.
        </p>

        <div className="flex w-full items-center gap-2 rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-brand-dark-50 dark:bg-brand-dark-800 px-3 py-2.5">
          <code className="flex-1 truncate text-sm text-brand-dark-700 dark:text-brand-lime-200">
            {shortLink}
          </code>
          <button
            onClick={copyLink}
            className="flex-shrink-0 text-brand-dark-400 hover:text-brand-lime-600"
          >
            {copied ? (
              <Check size={16} className="text-brand-lime-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        <button
          onClick={downloadQr}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 transition-all hover:bg-brand-lime-400 active:scale-95"
        >
          <Download size={16} />
          Download QR Code
        </button>

        {wifiQrDataUrl && (
          <>
            <div className="mt-2 w-full border-t border-dashed border-brand-dark-200 dark:border-brand-dark-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark-500 dark:text-brand-dark-300">
              For attendees without data
            </p>
            <div className="animate-scale-in rounded-2xl border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-700 dark:bg-brand-dark-900">
              <img
                src={wifiQrDataUrl}
                alt="Wi-Fi join QR code"
                className="h-48 w-48"
              />
            </div>
            <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
              {wifiSsid ? `Network: ${wifiSsid}` : ""}
              {wifiPassword ? ` · Password: ${wifiPassword}` : ""}
            </p>
            <button
              onClick={downloadWifiQr}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-dark-200 dark:border-brand-dark-700 px-4 py-2.5 text-sm font-semibold text-brand-dark-700 dark:text-brand-lime-200 transition-all hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800 active:scale-95"
            >
              <Download size={16} />
              Download Wi-Fi QR Code
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
