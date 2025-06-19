/**
 * Finds the parents folder's path by given the folder id.
 */
function findParentPathById (data, targetId, path = [])  {
  for (const item of data) {
    const currentPath = [ ...path, item.id ];

    if (item.id === targetId) {
      return currentPath;
    }

    if (item.children) {
      const result = findParentPathById(item.children, targetId, currentPath);
      if (result) {
return result;
}
    }

    if (item.layerInstance?.id === targetId) {
      return [ ...currentPath, targetId ];
    }
  }

  return null
}

export default findParentPathById
