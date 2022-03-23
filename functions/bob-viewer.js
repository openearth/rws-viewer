const data = {
  'id': '0001',
  'name': 'Some other Viewer',
  'metadata': [],
  'children': [
    {
      'id': '0002',
      'name': 'Aangewezen windenergiegebied NWP',
      'url': 'https://geoservices.rijkswaterstaat.nl/apps/geoserver/windenergiegebieden/wms',
      'layer': 'windenergiegebieden:aangewezen_windenergiegebieden__nwp_II_',
      'downloadUrl': '',
      'downloadLayer': '',
      'tags': [
        'Gebruik',
      ],
      'metadata': [],
    },
    {
      'id': '0003',
      'name': 'Reguliere monitoring WMR',
      'metadata': [],
      'children': [
        {
          'id': '85222925',
          'name': 'Zeehonden',
          'url': 'https://opengeodata.wmr.wur.nl/geoserver/IHM/wms',
          'layer': 'ZH_All_OD_Geo_view',
          'downloadUrl': 'https://opengeodata.wmr.wur.nl/geoserver/IHM/wfs',
          'downloadLayer': '',
          'tags': [
            'Zoogdieren',
            'Noordzee',
          ],
          'metadata': [],
        },
      ],
    },
  ],
}

exports.handler = async function() {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}
