/**
 * SafePhone DR - Node compatibility guard
 *
 * Why this exists:
 * - Expo SDK 50 + Windows can crash on very new Node versions (ex: Node 25)
 *   due to stdlib modules like "node:sea" being used in filesystem paths.
 * - This guard fails fast with a clear message for non-technical users.
 */

function parseMajor(version) {
  const major = Number(String(version).split(".")[0]);
  return Number.isFinite(major) ? major : 0;
}

const major = parseMajor(process.versions.node);

// Expo is most stable on Node LTS (18/20/22). Node 25 is not supported.
const MIN = 18;
const MAX_EXCLUSIVE = 23;

if (major < MIN || major >= MAX_EXCLUSIVE) {
  // Keep message short and actionable (Dutch + Spanish, since the app is for DR).
  // eslint-disable-next-line no-console
  console.warn(
    [
      "",
      "⚠️ Node.js versie is niet ideaal voor Expo (SafePhone DR).",
      `   Jouw Node versie: ${process.versions.node}`,
      "",
      "✅ Aanbevolen: installeer Node.js 20 LTS en herstart je terminal.",
      "   Download: https://nodejs.org/en/download",
      "",
      "ES: Instala Node.js 20 LTS y vuelve a intentar.",
      "",
      "Daarna:",
      "  npm install",
      "  npx expo start --clear",
      ""
    ].join("\n")
  );
  // Don't hard-fail: some Windows setups can still run with a patched Expo CLI.
}


