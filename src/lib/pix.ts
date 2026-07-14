function sanitizeAscii(str: string) {
  return (str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();
}

function tlv(id: string, value: string) {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16ccitt(str: string) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(pixKey: string, amount: number, merchantName: string, merchantCity = "Vitoria") {
  const name = (sanitizeAscii(merchantName).substring(0, 25) || "RECEBEDOR").toUpperCase();
  const city = (sanitizeAscii(merchantCity).substring(0, 15) || "VITORIA").toUpperCase();
  const merchantAccountInfo = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", pixKey));
  const payload =
    tlv("00", "01") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    tlv("62", tlv("05", "***")) +
    "6304";
  return payload + crc16ccitt(payload);
}
