export default class Tree {
  constructor() {
    this.tree = new Map()
  }

  addVertex(v) {
    if (!this.tree.has(v)) {
      this.tree.set(v, { children: [] })
    }
  }

  addEdge(v, w) {
    this.tree.get(v).children.push(w)
  }

  setVertexExtra(v, prop, data) {
    this.tree.get(v)[prop] = data
  }

  getChildren(v) {
    return this.tree.get(v).children
  }

  getVertexExtra(v, prop) {
    return this.tree.get(v)[prop]
  }

  serialize(root) {
    const ret = { ...this.tree.get(root) }
    ret.children = ret.children.map((child) => ({
      name: child,
      children: this.serialize(child),
    }))
    return { name: root, ...ret }
  }
}
