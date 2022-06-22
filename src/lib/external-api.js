export const generateDownloadUrl = (url, propertyMap, {
  areas,
}) => {
  const areaFilter = `${ propertyMap.area }:in:[${ areas.map((area) => `"${ area }"`).join(',') }]`

  return `${ url }?filter=${ areaFilter };&format=csv`
}
