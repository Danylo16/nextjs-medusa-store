export function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, "").trim()
}

export function isPhoneValid(input: string) {
  const p = normalizePhone(input)
  const digits = p.replace(/[^\d]/g, "")
  // 9-15 цифр — нормальна рамка для UA/EU
  return digits.length >= 9 && digits.length <= 15
}
