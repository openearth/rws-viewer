import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'

function buildChildrenTree(items) {
  items.forEach(item => {
    
    if (item.children) {
      item.children.forEach(child => {
        if (child.tags) {
          child.tags = child.tags.map(({ title }) => title)
        }
      })
    }
    
    if (item.tags) {
      item.tags = item.tags.map(({ title }) => title)
    }

    if (item.parent) {
      const parent = items.find(p => p.id === item.parent.id)
      if (parent.children == null) {
        parent.children = []
      }
      parent.children.push(item)
    }
  })
}
export default function handleMenu(options) {
  const { publicDir } = options

  return async function execute({ data }) {
    const { menu } = data
    const rootPages = page => page.parent === null
    
    buildChildrenTree(menu)

    const removeParentProperty = menu => {
      const { parent, children = [], ...item } = menu
      return {
        ...item,
        ...(children.length ? { children: children.map(removeParentProperty) } : {}),
      }
    }
    
    menu
      .filter(rootPages)
      .map(({ children, ...rest }) => ({ ...rest, layers: children }))
      .map(removeParentProperty)
      .forEach(root => {
        const title = slugify(root.name)
        fs.writeFile(
          `${ publicDir }/${ title }.json`,
          JSON.stringify(root, null, 2),
        )
      })
    }
  }

