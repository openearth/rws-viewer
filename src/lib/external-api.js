const apiUrls = {
  'https://dd-eco-api.sovon.nl': 'sovon',
  'https://lol.nl': 'other',
}

const mapping = {
  sovon: {
    area: 'gebiedid',
  },
  other: {
    area: 'areaId',
  },
}

const loaders = {
  sovon: ({ areas }) => `https://dd-eco-api.sovon.nl/api/v2/measurement?filter=${ areas.map(area => `gebiedid:eq:${ area }`).join(';') };&format=csv`,
  other: ({ areas }) => `https://lol.nl/v1/hoi?areas=${ areas.join(',') }`,
}

function getExternalApiName (url) {
  const name = Object.entries(apiUrls).find(([ key ]) => url.includes(key))[1]

  if (!name) {
    console.warn('It seems a mapping for this external API url has not been created yet. Please create one in src/lib/external-api.js')
  }

  return name
}

export function getExternalApiPropertyMapping(url) {
  const apiName = getExternalApiName(url)

  return mapping[apiName]
}

export function generateDownloadUrl(url, { areas }) {
  const apiName = getExternalApiName(url)
  const loader = loaders[apiName]

  return loader({ areas })
}
