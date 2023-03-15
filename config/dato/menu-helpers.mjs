import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'
import { PUBLIC_DIR } from './constants.mjs'
import mkdirp from 'mkdirp'

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

export default async function dumpMenus(menus, language) {
  const rootPages = page => page.parent === null

  try {
    buildChildrenTree(menus)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }

  const removeParentProperty = menu => {
    const { parent, children = [], ...item } = menu
    return {
      ...item,
      ...(children.length ? { children: children.map(removeParentProperty) } : {}),
    }
  }

  await mkdirp(`${ PUBLIC_DIR }/${ language }`)
  
  try {
  menus
    .filter(rootPages)
    .map(removeParentProperty)
    .forEach(root => {
      const title = slugify(root.name)
      fs.writeFile(
        `${ PUBLIC_DIR }/${ language }/${ title }.json`,
        JSON.stringify(root, null, 2),
      )
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
