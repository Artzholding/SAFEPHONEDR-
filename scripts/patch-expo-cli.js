/**
 * SafePhone DR - Patch Expo CLI for Windows + Node "node:*" externals
 *
 * Expo CLI (some versions) tries to create shims under:
 *   .expo/metro/externals/<moduleId>/index.js
 * If moduleId contains ":" (e.g. "node:sea"), Windows cannot create that folder.
 *
 * This script patches:
 *   node_modules/@expo/cli/build/src/start/server/metro/externals.js
 * to replace ":" with "_" only for the filesystem folder name.
 *
 * Runs automatically after install via package.json "postinstall".
 */

const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "start",
  "server",
  "metro",
  "externals.js"
);

function patch(contents) {
  // Already patched?
  if (contents.includes("safeDirName") && contents.includes("replace(/[:]/g, \"_\")")) {
    return { contents, changed: false };
  }

  // Patch shimDir naming
  const needle = "const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId);";
  const replacement =
    [
      "// Windows does not allow \":\" in folder names, but some Node stdlib ids include \"node:*\".",
      "// Keep the external mapping key as-is (moduleId), but use a filesystem-safe folder name.",
      "const safeDirName = moduleId.replace(/[:]/g, \"_\");",
      "const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, safeDirName);"
    ].join("\n        ");

  if (!contents.includes(needle)) {
    return { contents, changed: false, reason: "needle-not-found" };
  }

  return { contents: contents.replace(needle, replacement), changed: true };
}

try {
  if (!fs.existsSync(target)) {
    console.log("[patch-expo-cli] target not found, skipping:", target);
    process.exit(0);
  }

  const original = fs.readFileSync(target, "utf8");
  const result = patch(original);

  if (result.changed) {
    fs.writeFileSync(target, result.contents, "utf8");
    console.log("[patch-expo-cli] patched:", target);
  } else {
    console.log("[patch-expo-cli] already patched or not needed.");
  }
} catch (e) {
  console.warn("[patch-expo-cli] failed:", e && e.message ? e.message : e);
  // Don't fail install; it's a best-effort patch.
  process.exit(0);
}


