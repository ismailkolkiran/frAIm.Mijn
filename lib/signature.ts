export type SignatureProfile = {
  volledige_naam: string;
  functie: string | null;
  email: string;
  telefoon: string | null;
  profielfoto_url: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildSignatureHtml(profile: SignatureProfile) {
  const naam = escapeHtml(profile.volledige_naam);
  const functie = escapeHtml(profile.functie ?? "Medewerker ImmoKeuring BV");
  const telefoon = escapeHtml(profile.telefoon ?? "Niet ingesteld");
  const email = escapeHtml(profile.email);
  const foto = profile.profielfoto_url ? escapeHtml(profile.profielfoto_url) : null;

  return `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <title>Email Handtekening</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;">
    <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;color:#1f2937;width:680px;max-width:680px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding:16px 18px 16px 0;">
          <div style="font-size:44px;line-height:1;font-weight:700;letter-spacing:0.3px;color:#2f3b4d;">${naam}</div>
          <div style="margin-top:10px;font-size:40px;line-height:1.1;font-weight:600;color:#8ea867;">${functie}</div>
          ${
            foto
              ? `<div style="margin-top:18px;width:120px;height:120px;border-radius:60px;overflow:hidden;background:#ffffff;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;">
                   <img src="${foto}" alt="${naam}" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:cover;background:#ffffff;" />
                 </div>`
              : ""
          }
        </td>
        <td style="width:2px;background:#2f3b4d;"></td>
        <td style="width:50%;vertical-align:top;padding:16px 0 16px 18px;">
          <div style="font-size:40px;line-height:1.2;color:#8ea867;font-weight:700;">M ${telefoon}</div>
          <div style="margin-top:10px;font-size:40px;line-height:1.2;color:#8ea867;font-weight:700;">E ${email}</div>
          <div style="margin-top:48px;font-size:46px;line-height:1.2;color:#8ea867;font-weight:700;">ImmoKeuring</div>
          <div style="margin-top:46px;font-size:46px;line-height:1.2;color:#111111;font-weight:700;">immokeuring.be</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
