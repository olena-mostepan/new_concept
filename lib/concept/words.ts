import { plural, t, type Lang } from "./i18n";
import { OWNER_LABEL, type Owner } from "./model";

export const ownerLabel = (lang: Lang, owner: Owner) =>
  t(lang, OWNER_LABEL[owner]);

export const WORDS = {
  asset: "asset",
  assets: "assets",
  Asset: "Asset",
  Assets: "Assets",
  package: "package",
  packages: "packages",
  Package: "Package",
  Packages: "Packages",
} as const;

export const wordAssets = (lang: Lang) => ({
  asset: t(lang, "asset"),
  assets: t(lang, "assets"),
  Asset: t(lang, "Asset"),
  Assets: t(lang, "Assets"),
  package: t(lang, "package"),
  packages: t(lang, "packages"),
  Package: t(lang, "Package"),
  Packages: t(lang, "Packages"),
});

export const nAssets = (n: number, lang: Lang = "en") =>
  `${n} ${n === 1 ? t(lang, WORDS.asset) : t(lang, WORDS.assets)}`;

export const nPackages = (n: number, lang: Lang = "en") =>
  `${n} ${n === 1 ? t(lang, WORDS.package) : t(lang, WORDS.packages)}`;

export const assetsNeedFixingFirst = (n: number, lang: Lang = "en") =>
  plural(
    n,
    "1 asset needs fixing first",
    "{0} assets need fixing first",
    lang,
    n,
  );

export const fixAssetsAction = (n: number, lang: Lang = "en") =>
  plural(n, "Fix 1 asset", "Fix {0} assets", lang, n);

export const nProjects = (n: number, lang: Lang = "en") =>
  plural(n, "1 project", "{0} projects", lang, n);
