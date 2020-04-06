/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react'

import PropTypes from 'prop-types'
import dfs, { Node } from './datastructure/dfs'

export function Tree({
  width,
  height,
  tree,
  branchStrokeStyle = 'black',
  treeStrokeWidth = 1,
  rowConnectorDash = [2, 2],
  nodeHandleRadius = 4,
  collapsedNodeHandleFillStyle = 'white',
  nodeHandleFillStyle = 'black',
  nodeClicked = () => {
    /* do nothing*/
  },
}: {
  width: number
  height: number
  tree: any
  branchStrokeStyle?: string
  treeStrokeWidth?: number
  rowConnectorDash?: [number, number]
  nodeHandleRadius?: number
  collapsedNodeHandleFillStyle?: string
  nodeHandleFillStyle?: string
  nodeClicked?: Function
}) {
  const treeCanvas = useRef<HTMLCanvasElement>(null)
  // useEffect+useRef is a conventional way to draw to
  // canvas using React. the ref is a "reference to the canvas DOM element"
  // and the useEffect makes sure to update it when the ref changes and/or
  // the props that are relevant to all the drawing code within here change
  useEffect(() => {
    if (!treeCanvas.current) {
      return
    }
    const ctx = treeCanvas.current.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.strokeStyle = branchStrokeStyle
    ctx.lineWidth = treeStrokeWidth
    dfs(
      tree,
      (node: Node, parent: Node | undefined, control: { cutoff: boolean }) => {
        if (node.collapsed) {
          control.cutoff = true
        }
        const p = parent && parent.position ? parent.position : { x: 0, y: 0 }
        const q = node.position ? node.position : { x: 0, y: 0 }
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x, q.y)
        ctx.lineTo(q.x, q.y)
        ctx.stroke()
      }
    )
    // nodes.forEach((node: any) => {
    //   if (!ancestorCollapsed[node]) {
    //     if (!nodeChildren[node].length) {
    //       ctx.setLineDash([])
    //       ctx.beginPath()
    //       ctx.fillRect(
    //         nx[node],
    //         ny[node] - nodeHandleRadius,
    //         1,
    //         2 * nodeHandleRadius
    //       )
    //     }
    //     if (nodeChildren[node].length && !collapsed[node]) {
    //       ctx.setLineDash([])
    //       nodeChildren[node].forEach((child: any) => {
    //         ctx.beginPath()
    //         ctx.moveTo(nx[node], ny[node])
    //         ctx.lineTo(nx[node], ny[child])
    //         ctx.lineTo(nx[child], ny[child])
    //         ctx.stroke()
    //       })
    //     } else {
    //       ctx.setLineDash(rowConnectorDash)
    //       ctx.beginPath()
    //       ctx.moveTo(nx[node], ny[node])
    //       ctx.lineTo(width, ny[node])
    //       ctx.stroke()
    //     }
    //   }
    // nodesWithHandles.forEach((node: any) => {
    //   makeNodeHandlePath(node, ctx)
    //   if (collapsed[node]) {
    //     ctx.fillStyle = collapsedNodeHandleFillStyle
    //   } else {
    //     ctx.fillStyle = nodeHandleFillStyle
    //     ctx.stroke()
    //   }
    //   ctx.fill()
    // })
  }, [tree])

  return (
    <canvas
      ref={treeCanvas}
      // onClick={(evt) => {
      //   const { clientX, clientY } = evt
      //   if (!treeCanvas.current) {
      //     return
      //   }
      //   const ctx = treeCanvas.current.getContext('2d')
      //   if (!ctx) {
      //     return
      //   }
      //   const mouseX = clientX - treeCanvas.current.getBoundingClientRect().left
      //   const mouseY = clientY - treeCanvas.current.getBoundingClientRect().top
      //   let clickedNode = null
      //   nodesWithHandles.forEach((node: any) => {
      //     makeNodeHandlePath(node, ctx)
      //     if (ctx.isPointInPath(mouseX, mouseY)) {
      //       clickedNode = node
      //     }
      //   })
      //   if (clickedNode && nodeClicked) {
      //     nodeClicked(clickedNode)
      //   }
      // }}
      width={width}
      height={height}
      style={{ width, height }}
    />
  )
}
Tree.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  branchStrokeStyle: PropTypes.any,
  treeStrokeWidth: PropTypes.any,
  rowHeight: PropTypes.number,
  nodeHandleRadius: PropTypes.number,
  rowConnectorDash: PropTypes.any,
  nodeClicked: PropTypes.func,
  collapsedNodeHandleFillStyle: PropTypes.string,
  nodeHandleFillStyle: PropTypes.string,
}
