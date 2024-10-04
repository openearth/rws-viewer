import axios from 'axios'
import { curry, times, pipe, split, map } from 'ramda'
import slugify from '@sindresorhus/slugify'
import { datoEnvironment } from './constants.mjs'
import { instances } from './instances.js'

const capitaliseFirstLetter = ([ first, ...rest ]) => first.toUpperCase() + rest.join('')
const lowerCaseFirstLetter =  ([ first, ...rest ]) => first.toLowerCase() + rest.join('')
const camelCase = pipe(
  slugify,
  split('-'),
  map(capitaliseFirstLetter),
  lowerCaseFirstLetter,
)

const defaultFirst = 100

const currentInstance = instances.find(
  (instance) => instance.name === process.env.DATO_INSTANCE_CURRENT
);

if (!currentInstance) {
  throw new Error("No current instance found");
}

const token = currentInstance.datoApiKey;

const endpoint =
  process.env.NODE_ENV === 'production'
    ? 'https://graphql.datocms.com/'
    : 'https://graphql.datocms.com/preview'

function executeFetch(variables, query) {
  return axios({
    method: 'POST',
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${ token }`,
      'X-Environment': datoEnvironment,
    },
    data: { query, variables },
  }).then(res => {
    if (res.data.errors) {
      throw new Error(JSON.stringify(res.data.errors))
    }
    return res
  })
}

function getPaginatedData(variables, query) {
  return async function (response) {
    const keyRegex = /_all(.+)Meta/
    let allKey

    try {
      allKey = Object.keys(response.data.data).find(key => keyRegex.test(key))
    } catch (error) {
      console.error(error)
    }

    if (allKey) {
      const { count } = response.data.data[allKey]
      const [ , originalKey ] = allKey.match(keyRegex).map(camelCase)
      const itemsInResponse = response.data.data[originalKey]
      const remainingAmount = count - itemsInResponse.length

      if (remainingAmount <= 0) {
        delete response.data.data[allKey]
        return response
      }

      const totalRemainingRequests = Math.ceil(
        remainingAmount / itemsInResponse.length,
      )

      const promises = times(iteration => {
        const skip = iteration * variables.first + itemsInResponse.length
        const currentDate = new Date().toString()
        return executeFetch({ ...variables, skip, currentDate }, query)
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

export default curry(function query(variables, query) {
  const args = [{ first: defaultFirst, ...variables }, query]
  return executeFetch(...args)
    .then(getPaginatedData(...args))
    .then(returnData)
})
