export const generateDownloadUrl = ({
  url,
  propertyMapping,
  data: { areas },
}) => {
  const areaFilter = `${ propertyMapping.area }:in:[${ areas
    .map((area) => `"${ area }"`)
    .join(',') }]`

  return `${ url }?filter=${ areaFilter };&format=csv`
}
