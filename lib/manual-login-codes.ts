const manualLoginCodes: Record<string, string> = {
  "ismail.kolkiran@immokeuring.be": "948271",
  "niels.lever@immokeuring.be": "315804",
  "necmettin.calik@immokeuring.be": "772619",
  "ibrahim.duysak@immokeuring.be": "460293",
  "muhammed.cebeci@immokeuring.be": "589127",
  "mohamed.bachiri@immokeuring.be": "236740",
  "patrick.cornelis@immokeuring.be": "804952",
  "kurt.vandenbossche@immokeuring.be": "671385",
};

export function isManualLoginCodeValid(email: string, code: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const expected = manualLoginCodes[normalizedEmail];
  return expected === code;
}

export function getManualLoginCodeForEmail(email: string) {
  return manualLoginCodes[email.toLowerCase().trim()] ?? null;
}
