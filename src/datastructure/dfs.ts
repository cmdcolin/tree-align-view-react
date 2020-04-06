export interface Node {
  x: number
  y: number
  collapsed: boolean
  depth?: number
  position?: { x: number; y: number }
  length: number
  children: Node[]
}

export default function dfs(node: Node, callback: Function) {
  let cur, par, children
  const parents = []
  const nodes = [node]

  for (let i = nodes.length - 1; i >= 0; i--) {
    parents.push(undefined)
  }

  while (nodes.length > 0) {
    cur = nodes.pop()
    par = parents.pop()

    const ctrl = { stop: false, cutoff: false }
    callback.call(cur, cur, par, ctrl)

    if (ctrl.stop) {
      break
    }

    children = cur && cur.children ? cur.children : []

    for (let i = ctrl.cutoff ? -1 : children.length - 1; i >= 0; i--) {
      nodes.push(children[i])
      parents.push(cur)
    }
  }

  return node
}
