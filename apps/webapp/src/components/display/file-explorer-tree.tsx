import DirectoryTree from "antd/lib/tree/DirectoryTree"
import { get, set, trimEnd } from "lodash"
import RcTree from "rc-tree"
import React, { useEffect, useMemo, useState } from "react"
import { useDebounce } from "react-use"

interface Props {
  paths: string[]
  height: number
  onFileSelect: (filePath: string) => void
}

const getObjectPath = (path: string) => {
  const objectPath = trimEnd(path, "/").replace(/\//g, ".")

  return objectPath[0] === "." ? `/.${objectPath.slice(1, objectPath.length)}` : objectPath
}

const convertPathsToGraph = (paths: Props["paths"]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any = {}

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const objectPath = getObjectPath(path)
    const isFile = path.includes(".")

    if (isFile) {
      const filename = path.replace(/^.*[\\/]/, "")
      const fileDirectoryObjectPath = trimEnd(objectPath.replace(filename, ""), ".")
      const newFileIndex = (get(nodes, `${fileDirectoryObjectPath}.files`) || []).length

      set(nodes, `${fileDirectoryObjectPath}.files[${newFileIndex}]`, filename)
    } else {
      set(nodes, objectPath, {})
    }
  }

  return nodes
}

const transformToTreeDataStructure = (nodes, startPath = "") => {
  return Object.keys(nodes)
    .map(key => {
      if (key === "files") {
        return null
      }

      const files = nodes[key]?.files || []
      const nodeKey = [startPath, key].filter(fragment => !!fragment).join("/").replace("//", "/")
      const children = transformToTreeDataStructure(nodes[key], nodeKey)

      return {
        key: nodeKey,
        title: key,
        children:
          files.length > 0
            ? [...children, ...files.map(fileName => ({ key: `${nodeKey}/${fileName}`, title: fileName, isLeaf: true }))]
            : children,
      }
    })
    .filter(node => !!node)
}

export const FileExplorerTree: React.FC<Props> = props => {
  const [nodes, setNodes] = useState({})
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [expandedKeys, setExpandedKeys] = useState([])
  const treeRef = React.useRef<RcTree>()
  const treeData = useMemo(() => transformToTreeDataStructure(nodes), [nodes])

  useEffect(
    function setScrollPositionOnRerender() {
      if (treeData && treeRef?.current) {
        treeRef.current.scrollTo({ key: null, offset: lastScrollPosition + props.height, align: "bottom" })
      }
    },
    [treeData]
  )

  // Using debounce here to avoid intense re-renders when multiple events are streamed
  const [isRenderReady] = useDebounce(
    () => {
      setNodes(convertPathsToGraph(props.paths))
    },
    200,
    [props.paths]
  )

  return (
    <>
      {useMemo(
        () =>
          isRenderReady() ? (
            <>
              <DirectoryTree
                ref={treeRef}
                treeData={treeData}
                height={props.height}
                defaultExpandAll
                defaultExpandParent
                itemHeight={28}
                expandedKeys={expandedKeys}
                onScroll={() => {
                  const listElement = document.getElementsByClassName("ant-tree-list-holder-inner")[0] as HTMLElement
                  const offset = +listElement.style?.transform?.split?.("(")?.[1]?.split?.("p")?.[0]

                  setLastScrollPosition(offset)
                }}
                onExpand={expandedKeys => {
                  setExpandedKeys(expandedKeys)
                }}
                onSelect={(_, info) => {
                  if (info.node.isLeaf) {
                    props.onFileSelect(info.node.key.toString())
                  }
                }}
              />
            </>
          ) : null,
        [treeData, isRenderReady, expandedKeys, props.height]
      )}
    </>
  )
}
