export interface BankCardTheme {
  badge: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export function formatAccountNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 4) return digits;

  const chunks: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    chunks.push(digits.substring(i, i + 4));
  }
  return chunks.join(" • ");
}

export function getBankCardTheme(bankName: string): BankCardTheme {
  const normalized = bankName.toUpperCase();

  if (normalized.includes("BCA")) {
    return {
      badge: "BCA PLATINUM",
      gradient: "linear-gradient(135deg, #141824 0%, #1e293b 50%, #0B0E14 100%)",
      textColor: "#F8FAFC",
      accentColor: "#38BDF8",
      borderColor: "rgba(56, 189, 248, 0.4)",
    };
  }

  if (normalized.includes("MANDIRI")) {
    return {
      badge: "MANDIRI PRIORITAS",
      gradient: "linear-gradient(135deg, #2A1D0B 0%, #3d2c14 50%, #160E05 100%)",
      textColor: "#FEF3C7",
      accentColor: "#F59E0B",
      borderColor: "rgba(245, 158, 11, 0.45)",
    };
  }

  if (normalized.includes("BSI") || normalized.includes("SYARIAH")) {
    return {
      badge: "BSI HASANAH",
      gradient: "linear-gradient(135deg, #0A261D 0%, #134e3a 50%, #05140F 100%)",
      textColor: "#ECFDF5",
      accentColor: "#10B981",
      borderColor: "rgba(16, 185, 129, 0.45)",
    };
  }

  if (normalized.includes("BRI") || normalized.includes("BNI")) {
    return {
      badge: `${normalized.includes("BRI") ? "BRI" : "BNI"} EMERALD`,
      gradient: "linear-gradient(135deg, #0B1B33 0%, #1e3a8a 50%, #050E1A 100%)",
      textColor: "#EFF6FF",
      accentColor: "#60A5FA",
      borderColor: "rgba(96, 165, 250, 0.4)",
    };
  }

  return {
    badge: "PREMIUM TRANSFER",
    gradient: "linear-gradient(135deg, #261F23 0%, #3f2d36 50%, #140F12 100%)",
    textColor: "#FAF7F5",
    accentColor: "#CCA873",
    borderColor: "rgba(204, 168, 115, 0.4)",
  };
}

export function generateWhatsAppGiftConfirmationUrl({
  phoneNumber,
  coupleNames,
  senderName,
  bankName,
}: {
  phoneNumber: string;
  coupleNames: string;
  senderName: string;
  bankName?: string;
}): string {
  // Normalize phone number to 62...
  let cleanPhone = phoneNumber.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.substring(1);
  }

  const message = `Halo ${coupleNames}, saya (${senderName}) ingin mengonfirmasi bahwa kami telah mengirimkan tanda kasih ${
    bankName ? `via transfer ${bankName}` : "kado fisik"
  } untuk hari bahagia Anda di Kebumen. Semoga barakah dan bahagia selalu!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
