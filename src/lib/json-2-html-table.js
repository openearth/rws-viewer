function buildSection (title, properties) {
  const htmlRows = Object.keys(properties)
    .map((property) => {
      return `<tr>
                <td style="font-weight:bold; width: 33%; overflow-wrap: break-word; vertical-align: top;"> ${ property }:</td>
                <td style="width: 67%; overflow-wrap: break-word; vertical-align: top;"> ${ properties[property] }</td>
            </tr>`
    })
    .join('')

  return `
  <div class="map-layer-info-section">
    <p style="position: sticky; top: 0; height: 20px; width: 100%; font-weight:bold; text-align:center; background-color: white; z-index: 1;">${ title }</p>
    <table style="table-layout: fixed; margin-top: 4px; width: 100%;">
      <tbody>
        ${ htmlRows }
      </tbody>
    </table>
  </div>`
}

export function buildCombinedPopup (sections) {
  return sections
    .map(({ title, properties }) => buildSection(title, properties))
    .join('')
}

export default function (layerName, json) {
  return buildCombinedPopup([ { title: layerName, properties: json[0] } ])
}
