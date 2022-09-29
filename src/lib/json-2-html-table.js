export default function(json) {
  
  const rows = json[0]
  const properties = Object.keys(rows)
  
  let htmlRows = properties.map(property => {
    return `<tr>
                <td style="font-weight:bold;" > ${ property }:</td>
                <td  > ${ rows[property] }</td>
            </tr>`
  })
  .join('')

 
  //build the table
  const table = `
	<table>
		<tbody>
			${ htmlRows }
		<tbody>
	<table>`

  return table
}


