import moveInArray from './move-in-array'

export default function moveInArrayByValue(array, value, newIndex) {
  const index = array.findIndex(item => item === value)

  if (index === -1) {
    return array
  }

  return moveInArray(array, index, newIndex)
}
