/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

export function Tree({
  width,
  height,
  nodes,
  branchStrokeStyle,
  treeStrokeWidth = 1,
  ancestorCollapsed,
  rowConnectorDash = [2, 2],
  nodeChildren,
  rowHeight = 24,
  nodeHandleRadius = 4,
  collapsed,
  collapsedNodeHandleFillStyle = 'white',
  nodeHandleFillStyle = 'black',
  nodeClicked = () => {
    /* do nothing*/
  },
  nx,
  ny,
}: {
  width: number
  height: number
  nodes: any
  branchStrokeStyle: string
  treeStrokeWidth: number
  ancestorCollapsed: any
  rowConnectorDash: [number, number]
  nodeChildren: any
  rowHeight: number
  nodeHandleRadius: number
  collapsed: any
  collapsedNodeHandleFillStyle: string
  nodeHandleFillStyle: string
  nodeClicked: Function
  nx: any
  ny: any
}) {
  const treeCanvas = useRef<HTMLCanvasElement>(null)

  const nodesWithHandles = nodes.filter(
    (node: any) => !ancestorCollapsed[node] && nodeChildren[node].length
  )

  const makeNodeHandlePath = useCallback(
    (node, ctx) => {
      ctx.beginPath()
      ctx.arc(nx[node], ny[node], nodeHandleRadius, 0, 2 * Math.PI)
    },
    [nodeHandleRadius, nx, ny]
  )

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
    nodes.forEach((node: any) => {
      if (!ancestorCollapsed[node]) {
        if (!nodeChildren[node].length) {
          ctx.setLineDash([])
          ctx.beginPath()
          ctx.fillRect(
            nx[node],
            ny[node] - nodeHandleRadius,
            1,
            2 * nodeHandleRadius
          )
        }
        if (nodeChildren[node].length && !collapsed[node]) {
          ctx.setLineDash([])
          nodeChildren[node].forEach((child: any) => {
            ctx.beginPath()
            ctx.moveTo(nx[node], ny[node])
            ctx.lineTo(nx[node], ny[child])
            ctx.lineTo(nx[child], ny[child])
            ctx.stroke()
          })
        } else {
          ctx.setLineDash(rowConnectorDash)
          ctx.beginPath()
          ctx.moveTo(nx[node], ny[node])
          ctx.lineTo(width, ny[node])
          ctx.stroke()
        }
      }
    })
    nodesWithHandles.forEach((node: any) => {
      makeNodeHandlePath(node, ctx)
      if (collapsed[node]) {
        ctx.fillStyle = collapsedNodeHandleFillStyle
      } else {
        ctx.fillStyle = nodeHandleFillStyle
        ctx.stroke()
      }
      ctx.fill()
    })
  }, [
    ancestorCollapsed,
    branchStrokeStyle,
    treeStrokeWidth,
    rowConnectorDash,
    nx,
    ny,
    nodes,
    nodeHandleRadius,
    nodeChildren,
    collapsed,
    nodesWithHandles,
    collapsedNodeHandleFillStyle,
    nodeHandleFillStyle,
    makeNodeHandlePath,
    width,
  ])

  return (
    <canvas
      ref={treeCanvas}
      onClick={(evt) => {
        const { clientX, clientY } = evt
        if (!treeCanvas.current) {
          return
        }
        const ctx = treeCanvas.current.getContext('2d')
        if (!ctx) {
          return
        }
        const mouseX = clientX - treeCanvas.current.getBoundingClientRect().left
        const mouseY = clientY - treeCanvas.current.getBoundingClientRect().top
        let clickedNode = null
        nodesWithHandles.forEach((node: any) => {
          makeNodeHandlePath(node, ctx)
          if (ctx.isPointInPath(mouseX, mouseY)) {
            clickedNode = node
          }
        })
        if (clickedNode && nodeClicked) {
          nodeClicked(clickedNode)
        }
      }}
      width={width}
      height={height}
      style={{ width, height }}
    />
  )
}
Tree.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nodes: PropTypes.any.isRequired,
  branchStrokeStyle: PropTypes.any.isRequired,
  treeStrokeWidth: PropTypes.any,
  ancestorCollapsed: PropTypes.any.isRequired,
  rowHeight: PropTypes.number,
  nodeChildren: PropTypes.any,
  nodeHandleRadius: PropTypes.number,
  rowConnectorDash: PropTypes.any,
  nodeClicked: PropTypes.func,
  collapsed: PropTypes.any,
  nx: PropTypes.any,
  ny: PropTypes.any,
  collapsedNodeHandleFillStyle: PropTypes.string,
  nodeHandleFillStyle: PropTypes.string,
}
