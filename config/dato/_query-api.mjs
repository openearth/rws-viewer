import axios from 'axios'
import { curry, times, pipe, split, map } from 'ramda'
import slugify from '@sindresorhus/slugify'

const capitaliseFirstLetter = ([ first, ...rest ]) => first.toUpperCase() + rest.join('')
const lowerCaseFirstLetter =  ([ first, ...rest ]) => first.toLowerCase() + rest.join('')
const camelCase = pipe(
  slugify,
  split('-'),
  map(capitaliseFirstLetter),
  lowerCaseFirstLetter,
)

const defaultFirst = 100

const endpoint =
  process.env.NODE_ENV === 'production'
    ? 'https://graphql.datocms.com/'
    : 'https://graphql.datocms.com/preview'

function executeFetch(token, variables, query) {
  return axios({
    method: 'POST',
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${ token }`,
    },
    data: { query, variables },
  }).then(res => {
    if (res.errors) {
      throw new Error(JSON.stringify(res.errors))
    }
    return res
  })
}

function getPaginatedData(token, variables, query) {
  return async function (response) {
    const keyRegex = /_all(.+)Meta/
    let allKey

    try {
      allKey = Object.keys(response.data.data).find(key => keyRegex.test(key))
    } catch (error) {
      console.log({ query, variables, responseData: response })
      console.log(response)
      console.error(error)
    }

    if (allKey) {
      const { count } = response.data.data[allKey]
      const [ , originalKey ] = allKey.match(keyRegex).map(camelCase)
      const itemsInResponse = response.data.data[originalKey]
      const remainingAmount = count - itemsInResponse.length
      const totalRemainingRequests = Math.ceil(
        remainingAmount / itemsInResponse.length,
      )

      const promises = times(iteration => {
        const skip = iteration * variables.first + itemsInResponse.length
        const currentDate = new Date().toString()
        return executeFetch(token, { ...variables, skip, currentDate }, query)
      }, totalRemainingRequests)

      await Promise.all(promises).then(responses =>
        responses.forEach(res => {
          response.data.data[originalKey] = [
            ...response.data.data[originalKey],
            ...res.data.data[originalKey],
          ]
        }),
      )

      delete response.data.data[allKey]
    }
    return response
  }
}

function returnData(response) {
  return response.data
}

export default curry(function query(token, variables, query) {
  const args = [ token, { first: defaultFirst, ...variables }, query ]
  return executeFetch(...args)
    .then(getPaginatedData(...args))
    .then(returnData)
})
