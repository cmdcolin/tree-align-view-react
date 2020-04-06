export default class Tree {
  constructor() {
    this.tree = new Map()
    this.extra = new Map()
  }

  addVertex(v) {
    if (!this.tree.has(v)) {
      this.tree.set(v, [])
    }
  }

  addEdge(v, w) {
    this.tree.get(v).push(w)
  }

  setVertexExtra(v, prop, data) {
    if (!this.extra.has(v)) {
      this.extra.set(v, {})
    }
    const extra = this.extra.get(v)
    extra[prop] = data
  }

  getChildren(v) {
    return this.tree.get(v)
  }

  getVertexExtra(v, prop) {
    const extra = this.extra.get(v)
    return extra ? extra[prop] : undefined
  }

  get maxDistFromRoot() {
    let currMax = 0
    this.inOrder('root', (node) => {
      currMax = Math.max(currMax, this.getVertexExtra(node, 'length'))
    })
    return currMax
  }

  get nodesInOrder() {
    const nodes = []
    this.inOrder('root', (node) => {
      nodes.push(node)
    })
    return nodes
  }

  inOrder(
    vert,
    callback = console.log,
    checkCondition = () => {
      /* intentionally blank */
    },
    parent = undefined
  ) {
    const ret = this.tree.get(vert)
    if (!ret) return
    const val = checkCondition(vert)
    console.log(val)
    if (val === -1) return
    this.inOrder(ret[1], callback, checkCondition, vert)
    callback(vert, parent)
    this.inOrder(ret[0], callback, checkCondition, vert)
  }

  preOrder(vert, callback = console.log, parent = undefined) {
    const ret = this.tree.get(vert)
    if (!ret) return
    const val = callback(vert, parent)
    if (val === -1) return
    this.preOrder(ret[0], callback, vert)
    this.preOrder(ret[1], callback, vert)
  }

  postOrder(vert, callback = console.log, parent = undefined) {
    const ret = this.tree.get(vert)
    if (!ret) return
    this.postOrder(ret[0], callback, vert)
    this.postOrder(ret[1], callback, vert)
    callback(vert, parent)
  }
}
