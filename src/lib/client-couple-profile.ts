export type AccountOwnerRole = "GROOM" | "BRIDE";

export function transitionCoupleOwnerRole<
  T extends {
    accountOwnerRole: AccountOwnerRole | "";
    groomName: string;
    brideName: string;
  },
>(
  current: T,
  role: AccountOwnerRole,
  legacyOwnerName: string,
  legacyPartnerName: string
): T {
  if (current.accountOwnerRole) {
    return { ...current, accountOwnerRole: role };
  }
  return {
    ...current,
    accountOwnerRole: role,
    groomName:
      current.groomName ||
      (role === "GROOM" ? legacyOwnerName : legacyPartnerName),
    brideName:
      current.brideName ||
      (role === "BRIDE" ? legacyOwnerName : legacyPartnerName),
  };
}

export function mapCoupleProfileOwner(input: {
  accountOwnerRole: AccountOwnerRole;
  groomName: string;
  brideName: string;
}) {
  return input.accountOwnerRole === "GROOM"
    ? { ownerName: input.groomName, partnerName: input.brideName }
    : { ownerName: input.brideName, partnerName: input.groomName };
}

const firstName = (value?: string | null) =>
  value?.trim().split(/\s+/)[0] ?? "";

export function resolveCoupleDisplayName(input: {
  coupleDisplayName?: string | null;
  groomName?: string | null;
  brideName?: string | null;
  userName?: string | null;
  partnerName?: string | null;
}): string {
  if (input.coupleDisplayName?.trim()) return input.coupleDisplayName.trim();
  if (input.groomName?.trim() && input.brideName?.trim()) {
    return `${firstName(input.groomName)} & ${firstName(input.brideName)}`;
  }
  if (input.userName?.trim() && input.partnerName?.trim()) {
    return `${firstName(input.userName)} & ${firstName(input.partnerName)}`;
  }
  return input.userName?.trim() || "Klien";
}
