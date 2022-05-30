function mapLayers() {

}

export default function mapRestResponse({ data, filterMap, id }) {
  return {
    id,
    [
      {
        "id": "85222880",
        "name": "Aangewezen windenergiegebied NWP",
        "url": "https://geoservices.rijkswaterstaat.nl/apps/geoserver/windenergiegebieden/wms",
        "layer": "windenergiegebieden:aangewezen_windenergiegebieden__nwp_II_",
        "downloadUrl": "",
        "downloadLayer": "",
        "filterData": {

        },
        "timeFilter": false,
        "columnFilter": null,
        "tags": [
          "Gebruik"
        ],
        "metadata": []
      }
    ]
  }
}