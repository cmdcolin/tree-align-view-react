export default class Tree {
  constructor() {
    this.tree = new Map()
  }

  addVertex(v) {
    this.tree.set(v, { children: [] })
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

  get maxDistFromRoot() {
    let currMax = 0
    this.inOrder('root', (node) => {
      currMax = Math.max(currMax, this.getVertexExtra(node, 'length'))
    })
    return currMax
  }

  // get nodesInOrder() {
  //   const nodes = []
  //   this.inOrder('root', (node) => {
  //     nodes.push(node)
  //   })
  //   return nodes
  // }

  // inOrder(
  //   vert,
  //   callback = console.log,
  //   checkCondition = () => {
  //     /* intentionally blank */
  //   },
  //   parent = undefined
  // ) {
  //   const ret = this.tree.get(vert)
  //   if (!ret) return
  //   const val = checkCondition(vert)
  //   console.log(val)
  //   if (val === -1) return
  //   this.inOrder(ret[1], callback, checkCondition, vert)
  //   callback(vert, parent)
  //   this.inOrder(ret[0], callback, checkCondition, vert)
  // }

  // preOrder(vert, callback = console.log, parent = undefined) {
  //   const ret = this.tree.get(vert)
  //   if (!ret) return
  //   const val = callback(vert, parent)
  //   if (val === -1) return
  //   this.preOrder(ret[0], callback, vert)
  //   this.preOrder(ret[1], callback, vert)
  // }

  // postOrder(vert, callback = console.log, parent = undefined) {
  //   const ret = this.tree.get(vert)
  //   if (!ret) return
  //   this.postOrder(ret[0], callback, vert)
  //   this.postOrder(ret[1], callback, vert)
  //   callback(vert, parent)
  // }

  toJSON(root) {
    return this.tree.get(root)
  }
}
