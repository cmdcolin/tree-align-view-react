import React from 'react'
import { Tree } from './Tree2'
import TreeStructure from './datastructure/tree'
import dfs, { Node } from './datastructure/dfs'

export default function Test() {
  const branches = [
    ['node1', 'Q112T8_TRIEI/59-200', 0.46854],
    ['node1', 'B7KLQ4_CYAP7/136-277', 0.22403],
    ['node2', 'B8M612_TALSN/206-353', 1.40693],
    ['node2', 'Q3J777_NITOC/19-161', 0.62262],
    ['node3', 'node2', 0.15499],
    ['node3', 'node1', 0.33627],
    ['node4', 'C3KMH7_SINFN/48-190', 0.49604],
    ['node4', 'C1DG58_AZOVD/44-186', 0.25028],
    ['node5', 'node4', 0.06679],
    ['node5', 'Q3SVR1_NITWN/44-186', 0.3309],
    ['node6', 'B8HLS5_CYAP4/14-156', 0.58897],
    ['node6', 'B1WNX3_CYAA5/19-161', 0.47743],
    ['node7', 'node6', 0.22328],
    ['node7', 'Q5P8V6_AROAE/74-216', 0.36091],
    ['node8', 'node7', 0.14569],
    ['node8', 'node5', 0.20621],
    ['node9', 'A5CDW1_ORITB/138-276', 0.50183],
    ['node9', 'node8', 0.37567],
    ['node10', 'node9', 0.09939],
    ['node10', 'node3', 0.13742],
    ['node11', 'B8LZ95_TALSN/146-306', 1.41538],
    ['node11', 'B3MG73_DROAN/322-472', 2.10673],
    ['node12', 'node11', 0.534],
    ['node12', 'node10', 0.54887],
    ['node35', 'B8FA67_DESAA/174-314', 0.84978],
    ['node35', 'B2J3A3_NOSP7/183-342', 1.04359],
    ['node13', 'node35', 0.31999],
    ['node13', 'node12', 0.14564],
    ['node31', 'B0JUR0_MICAN/39-182', 0.63921],
    ['node31', 'A8ZPF4_ACAM1/39-182', 0.30855],
    ['node28', 'node31', 0.42441],
    ['node28', 'Q2SM05_HAHCH/47-193', 0.66539],
    ['node14', 'node28', 0.79901],
    ['node14', 'node13', 0.15953],
    ['node15', 'B8F0C4_THASP/172-315', 0.57733],
    ['node15', 'A0R819_PELPD/171-314', 0.3654],
    ['node16', 'node15', 0.16561],
    ['node16', 'Q12BS7_POLSJ/169-312', 0.66949],
    ['node17', 'Q5P1T1_AROAE/182-325', 0.94748],
    ['node17', 'A1TXP2_MARHV/168-311', 0.39982],
    ['node18', 'node17', 0.16594],
    ['node18', 'node16', 0.12196],
    ['node30', 'A6LRL5_CLOB8/180-328', 1.12742],
    ['node30', 'node18', 0.36768],
    ['node19', 'Q6LH76_PHOPR/165-309', 0.40918],
    ['node19', 'D3VKI2_XENNA/117-263', 0.29264],
    ['node33', 'node19', 0.68671],
    ['node33', 'Q10V63_TRIEI/166-315', 1.60582],
    ['node20', 'Q9K9X4_BACHD/19-163', 0.71816],
    ['node20', 'node33', 0.27629],
    ['node21', 'A1WPJ8_VEREI/180-332', 0.49403],
    ['node21', 'A1VRC2_POLNA/30-181', 0.30377],
    ['node27', 'node21', 0.14517],
    ['node27', 'Q01P88_SOLUE/181-333', 0.53324],
    ['node29', 'node27', 0.52033],
    ['node29', 'Q8ZSE8_NOSS1/20-198', 0.70812],
    ['node34', 'A7ILC4_XANP2/116-266', 1.22242],
    ['node34', 'node29', 1.52935],
    ['node22', 'node34', 0.189],
    ['node22', 'node20', 0.05367],
    ['node23', 'Q5V1W0_HALMA/25-182', 0.97502],
    ['node23', 'D3T269_NATMM/179-319', 0.40294],
    ['node24', 'node23', 0.71769],
    ['node24', 'D2QCC4_SPILD/162-305', 0.84247],
    ['node26', 'node24', 0.39858],
    ['node26', 'node22', 0.29225],
    ['root', 'node26', 0.02808],
    ['root', 'node25', 0],
    ['node25', 'node30', 0.10532],
    ['node25', 'node14', 0.17052],
  ]

  const tree = new TreeStructure()
  branches.forEach((branch) => {
    tree.addVertex(branch[0])
    tree.addVertex(branch[1])
    tree.addEdge(branch[0], branch[1])
    tree.setVertexExtra(branch[1], 'length', branch[2])
  })
  tree.setVertexExtra('root', 'length', 0)
  const data = tree.serialize('root')
  const nodeHandleRadius = 4
  const treeStrokeWidth = 1
  const width = 100
  const depth = 100
  let maxDistFromRoot = 0
  let y = 0

  dfs(data, (node: Node, parent: Node, context: any) => {
    node.depth = parent.depth || 0 + node.length
    maxDistFromRoot = Math.max(maxDistFromRoot, node.depth)

    const x =
      nodeHandleRadius + treeStrokeWidth + (width * depth) / maxDistFromRoot
    y += 20
    node.position = { x, y }
    if (node.collapsed) {
      context.cutoff = true
    }
  })

  return <Tree width={200} height={500} tree={data} />
}
