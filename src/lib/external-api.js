import { saveAs } from 'file-saver'


export const generateDownloadUrl = ({
  url,
  filters,
  formatCsv,
  maxPageSize,
}) => {
  const formattedFilter = filters.map(({ name, comparer, value }) => `${ name }:${ comparer }:${ value }`).join(';')
  console.log(formatCsv, maxPageSize)
  const format = formatCsv ? '&format=csv' : ''
  const pages = maxPageSize ? `&pagesize=${maxPageSize}` : ''
  return `${ url }?filter=${ formattedFilter }${pages}${format}`
}

export const downloadFromUrl = ({ url, apiKey, formatCsv, fileName }) => {
  const options = {
    headers: {
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
  }

  if (formatCsv) {
    return fetch(url, options)
    .then(res => res.blob() )
    .then(blob => {
      console.log(blob, url)
      var file = window.URL.createObjectURL(blob)

      window.location.assign(file, fileName)
    })
    .catch(err => {
      console.log(err)
    })
  } else {
    return fetch(url, options)
      .then(res => res.json() )
      .then(data => {
        console.log(data)
        let blob = new Blob([ JSON.stringify(data) ], {
          type: 'application/json',
        })

        saveAs(blob, fileName)
      })
      .catch(err => {
        console.log(err)
      })
    }
}
