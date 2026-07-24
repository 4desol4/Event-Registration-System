// Builds the standard WIFI: QR payload that phone camera apps recognize as
// "join this network" — a separate, well-defined format from a regular URL.
// This is why a Wi-Fi QR and a form-link QR are always two separate codes,
// never one: a WIFI: code can only join a network, it can't also open a link.
export function buildWifiQrString(
  ssid: string,
  password: string | null | undefined,
): string {
  // Per the WIFI: QR spec, these characters must be backslash-escaped inside
  // each field or some scanners will fail to parse it.
  const escape = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");

  if (!password) {
    return `WIFI:T:nopass;S:${escape(ssid)};;`;
  }
  return `WIFI:T:WPA;S:${escape(ssid)};P:${escape(password)};;`;
}
