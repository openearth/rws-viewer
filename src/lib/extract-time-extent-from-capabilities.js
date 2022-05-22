/* 
 Reads the capabilities of the workspace and finds the time extend of the activeLayer
*/
import removeSpaceFromTime from './timeFunctions/remove-space-from-time'

export default ((capabilities, activeLayer) => {
  if (!capabilities || !activeLayer) {
    return []
  }
  let allLayers
  let layer
  let extent

  allLayers = capabilities.Layer.Layer
  
  layer = allLayers.find(
    (layer) => layer.Name._text === activeLayer,
  )
  
  try {
    extent =  Array.isArray(layer.Extent) ? layer.Extent[0]._text.split(',') : layer.Extent._text.split(',') 
  } catch (error){
    console.log('Something went wrong when tried to retrieve the timeExtent from the capabilities')
  }
  
  if (!extent){
    return []
  }
  const formattedExtent = extent.map(removeSpaceFromTime)
  return formattedExtent 
})
