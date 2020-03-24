/* eslint-disable react/forbid-prop-types */
import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from 'react'
import PropTypes from 'prop-types'
import Graph from './graph'
import './App.css'
import colorSchemes from './colorSchemes'

const defaultColorScheme = 'maeditor'

const useRaf = (arg, ms = 1e12, delay = 0) => {
  const [elapsed, set] = useState(0)

  useLayoutEffect(() => {
    let raf
    let timerStop
    let start

    const onFrame = () => {
      const time = Math.min(1, (Date.now() - start) / ms)
      set(time)
      loop()
    }
    const loop = () => {
      raf = requestAnimationFrame(onFrame)
    }
    const onStart = () => {
      timerStop = setTimeout(() => {
        cancelAnimationFrame(raf)
        set(1)
      }, ms)
      start = Date.now()
      loop()
    }
    const timerDelay = setTimeout(onStart, delay)

    return () => {
      clearTimeout(timerStop)
      clearTimeout(timerDelay)
      cancelAnimationFrame(raf)
    }
  }, [arg, delay, ms])

  return elapsed
}

const useTween = (arg, ms = 1000, delay = 0) => {
  const fn = t => t
  const t = useRaf(arg, ms, delay)
  return fn(t)
}

TreeCanvas.propTypes = {
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
function TreeCanvas({
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
  nodeClicked = () => {},
  nx,
  ny,
}) {
  const [currClick, setCurrClick] = useState()
  const [wasCollapsed, setWasCollapsed] = useState()
  const r = useTween(currClick, 100)
  const animating = r > 0 || r < 1
  const treeCanvas = useRef()
  const nodesWithHandles = nodes.filter(
    node => !ancestorCollapsed[node] && nodeChildren[node].length
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
    if (treeCanvas.current) {
      const ctx = treeCanvas.current.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = branchStrokeStyle
      ctx.lineWidth = treeStrokeWidth
      nodes.forEach(node => {
        if (!ancestorCollapsed[node]) {
          // foot at the end of the phylogenetic tree
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
          // lines to the children
          if (nodeChildren[node].length && !collapsed[node]) {
            ctx.setLineDash([])
            nodeChildren[node].forEach(child => {
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
      nodesWithHandles.forEach(node => {
        makeNodeHandlePath(node, ctx)
        if (collapsed[node]) {
          ctx.fillStyle = collapsedNodeHandleFillStyle
        } else {
          ctx.fillStyle = nodeHandleFillStyle
          ctx.stroke()
        }
        ctx.fill()
      })
    }
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
    height,
  ])

  return (
    <canvas
      ref={treeCanvas}
      onClick={evt => {
        const { clientX, clientY } = evt
        const mouseX = clientX - treeCanvas.current.getBoundingClientRect().left
        const mouseY = clientY - treeCanvas.current.getBoundingClientRect().top
        const ctx = treeCanvas.current.getContext('2d')
        let clickedNode = null
        nodesWithHandles.forEach(node => {
          makeNodeHandlePath(node, ctx)
          if (ctx.isPointInPath(mouseX, mouseY)) {
            clickedNode = node
          }
        })
        if (clickedNode && nodeClicked) {
          setCurrClick(clickedNode)
          setWasCollapsed(collapsed[clickedNode])
          setTimeout(() => {
            nodeClicked(clickedNode)
          }, 100)
        }
      }}
      width={width}
      height={height}
      style={{ width, height }}
    />
  )
}

SpeciesNames.propTypes = {
  nodes: PropTypes.any.isRequired,
  ancestorCollapsed: PropTypes.any.isRequired,
  colorScheme: PropTypes.any,
  rowData: PropTypes.any.isRequired,
  rowHeights: PropTypes.any.isRequired,
}
function SpeciesNames({
  nodes,
  ancestorCollapsed,
  rowHeights,
  rowData,
  colorScheme,
}) {
  return (
    <div>
      {nodes.map(node => {
        return (
          <div key={node} style={{ height: rowHeights[node] }}>
            {!ancestorCollapsed[node] && rowData[node] ? (
              <span>{node}</span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

MSARows.propTypes = {
  nodes: PropTypes.any.isRequired,
  style: PropTypes.any,
  ancestorCollapsed: PropTypes.any.isRequired,
  colorScheme: PropTypes.any,
  rowData: PropTypes.any.isRequired,
  rowHeights: PropTypes.any.isRequired,
}
function MSARows({
  nodes,
  style = {},
  ancestorCollapsed,
  rowHeights,
  rowData,
  colorScheme,
}) {
  const ref = useRef()

  return (
    <div ref={ref} style={style}>
      <div>
        {nodes.map(node => {
          return (
            <div
              key={node}
              style={{ height: `${rowHeights[node]}px`, display: 'flex' }}
            >
              {!ancestorCollapsed[node] && rowData[node]
                ? rowData[node].split('').map((c, i) => {
                    return (
                      <span
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${c}_${i}`}
                        style={{
                          color:
                            colorScheme[c.toUpperCase()] ||
                            colorScheme.default ||
                            'black',
                        }}
                      >
                        {c}
                      </span>
                    )
                  })
                : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

MSA.propTypes = {
  rowHeight: PropTypes.number,
  nameFontSize: PropTypes.number,
  width: PropTypes.string,
  height: PropTypes.number,
  treeWidth: PropTypes.number,
  nameWidth: PropTypes.number,
  branchStrokeStyle: PropTypes.string,
  nodeHandleRadius: PropTypes.number,
  nodeHandleFillStyle: PropTypes.string,
  colorScheme: PropTypes.string,
  collapsed: PropTypes.shape({}),
  rowData: PropTypes.shape({}).isRequired,
  branches: PropTypes.any.isRequired,
  root: PropTypes.string.isRequired,
}

function MSA({
  rowHeight: genericRowHeight = 24,
  nameFontSize = 12,
  width: containerWidth = '',
  height: containerHeight = null,
  treeWidth = 200,
  nameWidth = 200,
  branchStrokeStyle = 'black',
  nodeHandleRadius = 4,
  nodeHandleFillStyle = 'white',
  colorScheme: colorSchemeName = defaultColorScheme,
  collapsed: initialCollapsed = {},
  root,
  tree,
  rowData,
}) {
  const ref = useRef()
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const colorScheme = colorSchemes[colorSchemeName]
  const treeStrokeWidth = 1
  const availableTreeWidth = treeWidth - nodeHandleRadius - 2 * treeStrokeWidth
  const charFontName = 'Menlo,monospace'
  const nodes = []
  const nodeRank = {}
  const ancestorCollapsed = {}
  const distFromRoot = {}
  let maxDistFromRoot = 0

  const addNode = node => {
    if (!node) {
      throw new Error('All nodes must be named')
    }
    if (nodeRank[node]) {
      throw new Error(`All node names must be unique (duplicate '${node}')`)
    }
    nodeRank[node] = nodes.length
    nodes.push(node)
  }

  const addSubtree = (node, parent) => {
    distFromRoot[node] =
      (typeof parent !== 'undefined' ? distFromRoot[parent] : 0) +
      branchLength[node]
    maxDistFromRoot = Math.max(maxDistFromRoot, distFromRoot[node])
    ancestorCollapsed[node] = ancestorCollapsed[parent] || collapsed[parent]
    const kids = nodeChildren[node]
    if (kids.length === 2) {
      addSubtree(kids[0], node)
      addNode(node)
      addSubtree(kids[1], node)
    } else {
      addNode(node)
      kids.forEach(child => addSubtree(child, node))
    }
  }
  addSubtree(root)

  // layout tree
  const nx = {}
  const ny = {}
  const rowHeights = {}
  let treeHeight = 0
  nodes.forEach(node => {
    const rh =
      ancestorCollapsed[node] ||
      !(rowData[node] || (collapsed[node] && !ancestorCollapsed[node]))
        ? 0
        : genericRowHeight
    nx[node] =
      nodeHandleRadius +
      treeStrokeWidth +
      (availableTreeWidth * distFromRoot[node]) / maxDistFromRoot
    ny[node] = treeHeight + rh / 2
    rowHeights[node] = rh
    treeHeight += rh
  })

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight || treeHeight,
        overflowY: 'auto',
      }}
      ref={ref}
    >
      <div style={{ height: treeHeight, display: 'flex' }}>
        <TreeCanvas
          width={treeWidth}
          height={treeHeight}
          branchStrokeStyle={branchStrokeStyle}
          nodeClicked={node => {
            collapsed[node] = !collapsed[node]
            // clone object to trigger re-render
            setCollapsed({ ...collapsed })
          }}
          nodeChildren={nodeChildren}
          nodes={nodes}
          nx={nx}
          ny={ny}
          ancestorCollapsed={ancestorCollapsed}
          collapsed={collapsed}
        />

        <div
          style={{
            fontSize: `${nameFontSize}px`,
            marginLeft: '2px',
            marginRight: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          <SpeciesNames
            colorScheme={colorScheme}
            rowData={rowData}
            rowHeights={rowHeights}
            ancestorCollapsed={ancestorCollapsed}
            nodes={nodes}
          />
        </div>
        <MSARows
          style={{
            fontFamily: charFontName,
            fontSize: `${genericRowHeight}px`,
            overflow: 'auto',
          }}
          scrollTop={ref.current ? ref.current.scrollTop : 0}
          colorScheme={colorScheme}
          rowData={rowData}
          rowHeights={rowHeights}
          ancestorCollapsed={ancestorCollapsed}
          nodes={nodes}
        />
      </div>
    </div>
  )

  // return { element: container }
}
function App() {
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

  const graph = new Graph()
  branches.forEach(branch => {
    graph.addVertex(branch[0])
    graph.addVertex(branch[1])
    graph.addEdge(branch[0], branch[1])
    graph.addVertexData(branch[1], branch[2])
  })
  graph.dfs('root')
  return (
    <MSA
      root="root"
      tree={graph}
      branches={branches}
      rowData={{
        'B7KLQ4_CYAP7/136-277':
          'KRVYLDE.AGFDNRD.DYPYGYSPKGER..CYDLKCGKKRE....RVSWIGALKEGK...ILAP.LTFEGCCNRDLFEA.WLSQSLVPQLEP................GDIIILDNAT..FHKGETIREIVEE...............................AGCELWYL.....PAYSPDLNKIENWWSVLKTWMKQ...MLPEFETVR',
        'Q112T8_TRIEI/59-200':
          'SIVYVDE.AGIDNRE.DYSYDYGVKGKR..LPGMKLGKRTE....RVSWIAAINQEK...MFAS.LTFIRSCNRDLFEN.WLEHCLLPKLHP................GQVIIVDNAT..FHKSVDIEELVAK...............................VKCEIWYL.....PPYSPDFNKIERWWFVLKNWIRP...RLKEFKNFR',
        'Q3J777_NITOC/19-161':
          'RFVYLDE.SGFEPEV.SRRYAYAPKGRR..VYGLISGHRRP....RTSLLAARMDEG...FEAP.FLFEGTCNTAVFNA.WLEKELCPLLNS................NHIVIMDNAP..FHKAVSSREIIKK...............................TGAGILFL.....PPYSPDFNPIEKDFGNIKKIREY..NEHETLENIV',
        'B8M612_TALSN/206-353':
          'DLIFLDE.SIFNEKTGWRRHAYAPIGDD..AEIDADINWGK....TWSICAAMTLEG...YLPCTGIKDGYYSTGDFAD.WLETKLIPALSQIH............QFPMVIVLDNVK..IHTREHVSQIIES...............................AGHLIRYL.....PPYSPNYNPIELTFSVLKSWMKR...NWIFLRETC',
        'Q3SVR1_NITWN/44-186':
          'RLVFIDE.TWTKTNM.APLRGWAPRGQR..IRAKVPHGRWQ....TMTFMAALRHDR...ITAP.WFIEGPINGEAFLL.YIEKVLVPTLRH................GDIVIMDNLG..SHKASAVRRVIRA...............................AGARLFYL.....PKYSPDLNPIEQFFAKFKHWLRK..AAQRTTEAVY',
        'C1DG58_AZOVD/44-186':
          'KLIFVDE.TAASTNL.ARLRGWAPRGER..CRAAIPHGHWK....TTTFTAGLRVDG...LTAP.LVLDGAMNGPVFLA.YVGQVLVPELTP................GDIVVMDNLP..AHKVAGVRQAIEG...............................AGATLRYL.....PPYSPDLNPIEMAFSKLKALLRK..AAARTVPELW',
        'C3KMH7_SINFN/48-190':
          'RLVFIDE.TSTNTKL.TKRSGWAPKGQR..YRAHAPFGSWK....TQTFIAGLRSHG...VVAP.FIVNAPMNRRIFET.WIETQLAPTLSP................GDVVILDNVG..FHKSERAEQMVKA...............................KGAWLLFL.....PPYSPDLNPIEMAFSKLKALLRK..RAARSFDAIA',
        'Q5P8V6_AROAE/74-216':
          'RLRFIDE.SGVNIAM.TRHYGRALRGER..VPDAVPKNHGR....NVTLLGAVSCRG...IDAV.MTVEGPTDAAVFRA.YVDQVLVPALAP................GDIVVMDNLS..AHKVKGIRETIEG...............................AQADLLYL.....PPYSPDWSPIEPCWSKLKTALRA..AKARTREALD',
        'B1WNX3_CYAA5/19-161':
          'NLVFIDE.SGVNLAM.LRLYARSLKGTR..ARGEKPQKRGH....NISIIGALSLEK...ILAF.ANIYGSVNGVTFEA.FIVTELVPKLWT................GACVVMDNAK..IHLGEIVREAIEE...............................AGASLMYL.....PPYSPEFSPIENFWSKVKAILRK..IKARNYKDLI',
        'B8HLS5_CYAP4/14-156':
          'NLVFLDE.MGVLQGM.SRPRGRSRKGQR..VYDLKPFYRGR....RVTVVGAISQTS...ILAM.QTLGKSMTGEDFKQ.FVSEHLVPKLWS................GAVVVMDNLK..AHQVEGIEQMIEA...............................VGARVVYL.....SPYSPEFNPIEHLWWQLKALIRR..FVPKSVEAIT',
        'A5CDW1_ORITB/138-276':
          '.LVFIDE.SGIEDNA.CREYGWSIKGTR..CYVNKAYQHKS....RVSMIAGLCNNQ...IIAP.VIFEGNCNKEIFTT.YVETILIKELRP................GQIVIMDNIN..FHKNNTIKVLIES...............................VGCSILFL.....PTYSPDLNPIEHYWFKIKNEIRKVTAQFKD.....',
        'B3MG73_DROAN/322-472':
          'RVVFHDE.RRFNLDG.PDGFSYYFHDLRNYERTLSQRPRGN....SVYIYLMVCVGG........AVHLEVSSAKQRPESCIEAIMRERPNIVGK...........LGSPEFVLQDHNWMSHALPTAQDLLNA...............................EGLKTQKW.....PTIAHDLNIMENVWGWLIREVFDGGRKFSRKDDLI',
        'B8LZ95_TALSN/146-306':
          'SMLFSDF.VNFGLGTTRKAKVFNRKDERLCEDCLQSREEIDKALFHCWAMVGYDYKG...PLIFLETEDNDLSAMSQRD.YISQIIQLHVQPIV............TARRMIYLDNASEVYEHATAPQNMVHAY.............................LDSLHLPYIQ...NPPTSPDLNVLKDVLLLLKKRLQK..RSIGDQIQLK',
        'B2J3A3_NOSP7/183-342':
          'QVWFWDE.SGFSLRV.IRRKNWGKKGKR..KN.VLLLRRCG....RVNVMGAIRESD...RKRV.CFFVKKGNADIFYE.QLQQLNELIKQEWASIGNLGKDFSKHGPKIILILDNAS..FHKRKDIIAKISEE.............................FPNFVLEFL.....PAYSPDYNIIELVWHSCKEYIAH..RLFKSVDELQ',
        'B8FA67_DESAA/174-314':
          'DIWFADE.SGFDGDP.RPRRRWDKKGRK.....TRSTKNGDH..IRMNVIGMVCPRT...GEFF.AIEATNVFTEMFQV.FLDEAKKCIEFER..............ERNILILDNAT..WHKCKTLNWH...................................GFEPLFL.....PPYSPDLNPIERIWLIMKDRWFN.NHISKDRDALI',
        'Q2SM05_HAHCH/47-193':
          'DLYYFDE.SGFSQRS.NLPYGWSPVGQS..TR.LKSYSHSK....RLNVLGFMNRRQ...KLIF.HTTEERVDSAQVVA.LFNKLAESKDPLK...............NAVVLLDNAS..VHRSAEFRRHRWDWM...........................D.KSIWPIYF.....PKYSPELNLIEILWRKVKYNWLP.LGSHETFERLK',
        'A8ZPF4_ACAM1/39-182':
          'DLRYLDE.SGFCLVP.YVPYAWQEKGET.L...GLPSQRSS....RFNVLGLMNRHN...DLTS.YVFDKSITSAVVVA.CIDDFSRTCDQ.................HTVVVMDQAS..VHKNAEIEEKIEDW............................KAKNVEIFWL.....PTYSPHLNLIEIFWRFMKYEWIE.FAAYKCLGSLS',
        'B0JUR0_MICAN/39-182':
          'EIGYLDE.MGGDSKP.CIPEAWQEEKTT.I...KLPPIEGK....RLNILGIMKRDN...QLFY.ETQVGTVTSEIVIN.FLDKYCQNIQK.................KTVIIIDQAS..IHTSEAFMEKLEEW............................EKKNLKIFWL.....PTYSPHLNLIEILWRFLKYEWIE.FSAYKDRKSLL',
        'Q12BS7_POLSJ/169-312':
          'QIYWGDE.MGLRSDH.VSGKSYAPAGQT..PL.IRATGQRF....GCNMISAITNKG...ALAF.MVFEGKFRAPLFVE.FLRRLLKQVEG.................KICLIVDGHP..VHKSGVVKRFVQAN.............................AQRLRLILL.....PGYCPELNPDELLNQDVKTNALG.KSRPANKSEMI',
        'A0R819_PELPD/171-314':
          'EIYWGDE.TGIQTGA.NVERGYSPKGKT..PV.LRQTGRKH....RINMISAITNQG...KVRF.MFYKETMNSKRLIT.FMKRLVKDAGR.................KVYLILDNLK..VHHSHVVMDWLEKH.............................KDKIEVFYL.....PSYSPELNPDEYLNNSLKGRVHS.GERAQNVKQLE',
        'B8F0C4_THASP/172-315':
          'VIYWADE.TAVKEDT.NWIRGFAPAGRT..PV.LEASARWA....KLSMISAITNRG...EIAF.QIVEGTINAERFIE.FLERLIASAAS.................KVFLIVDNLR..VHHAKLVQAWVETR.............................RAQIELFYL.....PPYAPESNPDEYLNHDFKTALRL.EPPSRDDSQLL',
        'A1TXP2_MARHV/168-311':
          'TIYFGDE.ASIRSDY.HSGTTWAPKGET..PI.IRNTGSRF....SINLISAISPRG...ELRF.KTIQGTMNTDAFLG.FLKALVQDADK.................PVFLILDNHP..VHHARRVREYVESL.............................DGKLKLFFL.....PPYSPELNPDESVWGYIKYHHVG.KKIINSKEQLR',
        'Q5P1T1_AROAE/182-325':
          'EILFWDE.SGFRADA.VQGRTWGAKGRT..PV.VAVPGQRQ....SISAASAVSMKG...GFWF.AIYPGALNGELFVD.LLRKLMHRRRK.................PLHLVLDGLP..AHKKAGVKTYVAST.............................QGKLTLHFL.....PGYAPDLNPDELVWSHAKRTGNA.RRPLQKGETLQ',
        'A6LRL5_CLOB8/180-328':
          'VLYSLDE.TGLRTES.DIRRSWSQIGVS..PI.LESNNSHE....GINIIGATEISKNFDTIMDAYPAKHSIKSHEVEV.FLERLLKIHVGK................KVYVLLDNAK..FHTSRIIQDFADAH.............................SEELFLINT.....PRYSPILNPQENIWNKLKNCIFS.TSAFISIDELF',
        'Q10V63_TRIEI/166-315':
          'TVFMIDE.CHLLWGD.ILGYAWGKTDERIE...IAIKNEKE....RQTYYGALDYKT...KEFL.VQEYESGNTKNTIE.FIKYLQKQRPGN................KLAIFWDGAT..YHNSQEFREYLMTIN...........................QYLSEEELLINCTRFAPNAPEQNPVEDIWLQTKNFSIT...FYHLCSSFK',
        'D3VKI2_XENNA/117-263':
          'PLLFRDA.VPPSPST.KLSAGGMKAGKNQVKV.AETTGSRT....RLNLMGALNLQQ...IEETVIREYPTINAKNVVL.FFGAIRETYPLSQ...............KIHLILDGAG..YHRSEIVKFFAEV...............................LNIELHYL.....PPYSPNLNPIERLWKYANEQIRN.NVYFPDAKTFR',
        'Q6LH76_PHOPR/165-309':
          'PLLFMDA.VHPTQAT.KITAGWVKKGVD..KP.IETTGSRT....RLNIVGAIRLGH...LSEAIVDKYKTVNGESIIA.FLNRTRDFYRASG...............TIHLVLDGAG..YHRSFQVVEEAKK...............................LNIELHYL.....PPYSPNLNPIERLWKVMNKHARN.SRYFATAKEFR',
        'Q9K9X4_BACHD/19-163':
          'HLLFQDE.SMIRDYQ.ALQYTWFLKGKQ..RI.IPTYGKHQ....GVKLIGTLNYET...GDVL.CVEEERYDAEAFLR.FLQKVLKHYPTG................KIVMVLDNAR..IHHAKLIEPFLRNH.............................QHRLELVFL.....PPYSPELNLIEGLWKWLKSDVIN.NLFYSSVKEIR',
        'Q8ZSE8_NOSS1/20-198':
          'RTISIDEMTGIQATERLEKDLPMRPGKV..ERREFEYIRHG....TQSLIASFDVAT...GQIVEPTCSDTRTEIDFAL.HIRRTIETDTQAK...............KWHLIMDCLN..THQSESLVRLVAEKEGLNLDLGIKGESGILKSMKSRTTFLSDPAHRIVFHYT.....PKHSSWLNQIEIWFSILVRKLLR.RASFLSQDDLK',
        'Q01P88_SOLUE/181-333':
          'PVVCLDE.KPVTLHADVRPTSPAKPGRE..ARRDNEYERRG....TANVFCAVEPKA...GRHF.TFATPDRSAFEFAH.VVFELAMQYQQAD...............TIHLVLDNLN..IHCLKSLTDAFGMEMG........................CEVWDRFTIHFT.....PKHGSWLNQAEIEIGLFSRQCLG.KRRIPTLISLR',
        'A1VRC2_POLNA/30-181':
          'PVVCMDE.TPRQLIRETREPIAAAPGRP..ERHDYEYERCG....VCNVFMASEPLA...GRRL.TKVTERRTKTDWAV.FVQDIAASYPDAE...............RITLVMDNLN..THTPGSLYEAFSPEQA........................KALWDRFEFVYT.....PKHGSWLNMAEIEINVMVDQCLS..RRIDSIETVR',
        'A1WPJ8_VEREI/180-332':
          'PVVCFDE.SPTQLIGEVRQPIPAEPGQP..LRYDYEYKRNG....TANLFVFLDAHR...SWRR.VKVTERRMAQDFAQ.CMRDLVDIHYPQA..............ERIRLVLDNLS..THTAAALYQSMPPQEA........................RRILQRIEFHYT.....PKHASWLNMVEIEIGVLRRQCLD..RRIDCRERLI',
        'A7ILC4_XANP2/116-266':
          'VLLYGDE.SEALTHP.YLARAWAKSGAD..LR.VPAPGQAK....NVAMLGSLNHAT...RELI.VQTSPTKRSSDFVA.HLQQLDEAYGPKPGR..........AARPVVLVEDNGP..IHTSKLSRAALAAR.............................AHWLTVEWL.....PKYAPELNDIEAVWRDLKAHHLA.HQTFKDSDALD',
        'D2QCC4_SPILD/162-305':
          'VILYIDE.SACYLLP.FVAHTWAPCGQT..PV.LMEQAGRT....HLSLIAAIAANG...QIYV.AGQNQAFTSEDIVW.FLKLLCGRYRKR................NLLIIWDGAA..IHRSNVVKELLRER.............................LGRMHLERL.....PAYSPELNPVELLWSQLKRNLKN..KAFTSLDELT',
        'D3T269_NATMM/179-319':
          'TVVCIDQ.TKKSVQV.EPRAAWFPRGTR..PS.VELSGQRD....WTCLLGAITENG...DRFF.TRFEEYVTAAHAKH.FILALCQEFED.................NLIVVLDGAP..YFQASAVTDLAAR...............................DDLTFVRL.....PAYSPELNPVEECWRQLQAALSN..RFFDSLPELT',
        'Q5V1W0_HALMA/25-182':
          'TVVVVDQ.FTKHVGT.VQRRGFYPIGSN..PT.IEVATSWD....SVTVLGAVTDNG...DSFF.CWTEENLTRNHGIR.LLEALKDRFGE.................ELVVFLDRAG..YFYARDLWEHVSGERETETVG..............DSSVSCVRGDDLEVWYF.....PSKLPELNAVEGCWDQLQEWFKY..RLVPDISSLK',
      }}
      height={400}
    />
  )
}

export default App
