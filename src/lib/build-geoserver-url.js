import { stringify } from 'query-string'

export default function({ url, service, request, encode = true, ...rest }) {
  if (!service || !request) {
    return undefined
  }

  const params = stringify({ service, request,  ...rest }, { encode, sort: false })

  return `${ url }?${ params }`
}
