export function marketplaceCountryKey(country: string | null | undefined) {
  const normalized = (country ?? "").trim().toLocaleLowerCase("ar");
  if (normalized === "eg" || normalized.includes("مصر") || normalized.includes("egypt")) return "egypt";
  if (["sa", "ksa"].includes(normalized) || normalized.includes("السعود") || normalized.includes("saudi")) return "saudi";
  if (["ae", "uae"].includes(normalized) || normalized.includes("الإمار") || normalized.includes("emirates")) return "uae";
  if (normalized === "kw" || normalized.includes("الكويت") || normalized.includes("kuwait")) return "kuwait";
  if (normalized === "jo" || normalized.includes("الأردن") || normalized.includes("jordan")) return "jordan";
  if (normalized === "qa" || normalized.includes("قطر") || normalized.includes("qatar")) return "qatar";
  return normalized;
}

export function currencyForCountry(country: string | null | undefined) {
  switch (marketplaceCountryKey(country)) {
    case "saudi": return "ر.س";
    case "uae": return "د.إ";
    case "kuwait": return "د.ك";
    case "jordan": return "د.أ";
    case "qatar": return "ر.ق";
    default: return "ج.م";
  }
}
