export const generateDownloadUrl = ({
  url,
  filters,
}) => {
  const formattedFilter = filters.map(({ name, comparer, value }) => `${ name }:${ comparer }:${ value }`).join(';')

  return `${ url }?filter=${ formattedFilter };&pagesize=10000&format=csv`
}

export const downloadFromUrl = ({ url, apiKey }) => {
  const options = {
    headers: {
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
  }

  return fetch(url, options)
    .then(res => res.blob() )
    .then(blob => {
      var file = window.URL.createObjectURL(blob)

      window.location.assign(file)
    })
    .catch(err => {
      console.log(err)
    })
}
