export const generateDownloadUrl = ({
  url,
  filters,
}) => {
  const formattedFilter = filters.map(({ name, comparer, value }) => `${ name }:${ comparer }:${ value }`).join(';')

  return `${ url }?filter=${ formattedFilter };&pageSize=10000&format=csv`
}
