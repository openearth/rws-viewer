export const generateDownloadUrl = ({
  url,
  filters,
}) => {
  const formattedFilter = filters.map(({ name, comparer, value }) => `${ name }:${ comparer }:${ value }`).join(';')

  return `${ url }?filter=${ formattedFilter };&format=csv`
}
