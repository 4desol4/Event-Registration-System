import QRCode from "qrcode";

// Generates a QR code as a base64 data URL, pointing at the attendee form's
// short link. Frontend/print flyer consumes this directly as an <img> src.
export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}
