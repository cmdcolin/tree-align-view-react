export default class Graph {
  constructor() {
    this.graph = new Map()
    this.extra = new Map()
  }

  addVertex(v) {
    if (!this.graph.has(v)) {
      this.graph.set(v, [])
      this.extra.set(v, 0)
    }
  }

  addEdge(v, w) {
    this.graph.get(v).push(w)
    this.graph.get(w).push(v)
  }

  addVertexData(v, data) {
    this.extra.set(v, data)
  }

  // eslint-disable-next-line no-console
  dfs(vert, callback = console.log, visited = {}) {
    // eslint-disable-next-line no-param-reassign
    visited[vert] = true
    callback(vert)

    const neighbors = this.graph.get(vert)

    for (let i = 0; i < neighbors.length; i++) {
      const elem = neighbors[i]
      if (!visited[elem]) {
        this.dfs(elem, callback, visited)
      }
    }
  }
}
