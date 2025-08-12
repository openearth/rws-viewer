import buildWmsLayer from "./build-wms-layer"
import checkMapServiceType from "./check-map-service-type"
import buildWmtsLayer from "./build-wmts-layer"

export default (layerConfig) => {
    const mapServiceType = checkMapServiceType(layerConfig.url)
    if (mapServiceType === 'wms') {
        return buildWmsLayer(layerConfig)
    } else if (mapServiceType === 'wmts') {
       return buildWmtsLayer(layerConfig)
    }
}
