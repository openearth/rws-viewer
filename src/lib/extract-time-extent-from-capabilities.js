/* 
 NOTE: Same getCapabilities request has different format in the response (Thredd or Geoserver)
       and even in the same type of server.

*/
import removeSpaceFromTime from './formatTime/remove-space-from-time'
import getTimeExtentCaseP1d from './get-time-extent-case-p1d'


export default ((capabilities, activeLayer) => {
  if (!capabilities || !activeLayer) {
    return []
  }
  let allLayers
  let layer
  let extent
  
  if (capabilities.Layer.Layer.Layer) {
    console.log('case Thredds')
    allLayers = capabilities.Layer.Layer.Layer
    layer = allLayers.find(
      (layer) => layer.Name._text === activeLayer,
    )
    console.log('layer from GetCapabilities', layer)
    try {
        extent = Array.isArray(layer.Extent) ? layer.Extent[1]._text.split(',') 
                                             : layer.Extent._text.endsWith('P1D') 
                                             ? getTimeExtentCaseP1d(layer.Extent._text.split('/'))
                                             : layer.Extent._text.split(',')
    } catch (error){
      console.log('Something went wrong when tried to retrieve the timeExtent from the capabilities')
    } 
    
  } else {
    console.log('case Geoserver')
    allLayers = capabilities.Layer.Layer
    
    layer = allLayers.find(
      (layer) => layer.Name._text === activeLayer,
    )
    
    try {
      extent =  Array.isArray(layer.Extent) ? layer.Extent[0]._text.split(',') : layer.Extent._text.split(',') 
    } catch (error){
      console.log('Something went wrong when tried to retrieve the timeExtent from the capabilities')
    }
  }
  if (!extent){
    return []
  }
  const formattedExtent = extent.map(removeSpaceFromTime)
  return formattedExtent 
})
