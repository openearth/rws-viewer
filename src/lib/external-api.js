export const generateDownloadUrl = ({
  url,
  filters,
}) => {
  const formattedFilter = filters.map(({ name, comparer, value }) => `${ name }:${ comparer }:${ value }`).join(';')

  return `${ url }?filter=${ formattedFilter };&pagesize=10000&format=csv`
}
