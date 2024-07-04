export function getValidViewerConfigs(locale) {
  if (!locale) {
    return []
  }

  return require(`../../public/data/${ locale }/available-configs-viewers.json`)
}

export function getValidViewerNames(locale) {
  return getValidViewerConfigs(locale).map(({ name }) => name)
}
