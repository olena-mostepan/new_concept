export const WORDS = {
  asset: 'asset', assets: 'assets', Asset: 'Asset', Assets: 'Assets',
  package: 'package', packages: 'packages', Package: 'Package', Packages: 'Packages',
} as const

export const nAssets = (n: number) => `${n} ${n === 1 ? WORDS.asset : WORDS.assets}`
export const nPackages = (n: number) => `${n} ${n === 1 ? WORDS.package : WORDS.packages}`
