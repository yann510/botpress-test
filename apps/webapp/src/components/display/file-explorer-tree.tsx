import "../../ant-tree-styles.scss"

import { Folder, InsertDriveFile } from "@mui/icons-material"
import { Theme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import DirectoryTree from "antd/lib/tree/DirectoryTree"
import { get, set, trimEnd } from "lodash"
import RcTree from "rc-tree"
import React, { useEffect, useMemo, useState } from "react"
import {useDebounce, useWindowSize} from "react-use"
import { v4 as uuidv4 } from "uuid"

interface Node {
  id: string
  children?: Node[]
  isOpen?: boolean
}

interface Props {
  paths: string[]
  height: number
}

function getObjectPath(path: string) {
  const objectPath = trimEnd(path, "/").replace(/\//g, ".")

  return objectPath[0] === "." ? `/.${objectPath.slice(1, objectPath.length)}` : objectPath
}

// Only supports basic UNIX paths
// const convertPathsToNodes = (paths: Props["paths"]): Node => {
//   const nodes: any = {}
//
//   for (const path of paths) {
//     const objectPath = getObjectPath(path)
//
//     const isFile = path.includes(".")
//     if (isFile) {
//       const filename = path.replace(/^.*[\\/]/, "")
//       const fileDirectoryObjectPath = trimEnd(objectPath.replace(filename, ""), ".")
//       const newFileIndex = (get(nodes, `${fileDirectoryObjectPath}.files`) || []).length
//
//       set(nodes, `${fileDirectoryObjectPath}`, {id:filename})
//     } else {
//       set(nodes, objectPath, {})
//     }
//   }
//
//   const transformObjectToNodes = (object) => Object.keys(object).map(key => {
//     if (key === "files") {
//       return {id:}
//     }
//   })
//
//   return nodes
// }

const convertPathsToNodes = (paths: Props["paths"]): Node => {
  const nodes: any = {}

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    // Only supports basic UNIX paths

    const objectPath = getObjectPath(path)
    const key = `${i}-${path}`
    const isFile = path.includes(".")

    if (isFile) {
      const filename = path.replace(/^.*[\\/]/, "")
      const fileDirectoryObjectPath = trimEnd(objectPath.replace(filename, ""), ".")
      const newFileIndex = (get(nodes, `${fileDirectoryObjectPath}.files`) || []).length

      set(nodes, `${fileDirectoryObjectPath}.files[${newFileIndex}]`, { filename, key })
    } else {
      set(nodes, objectPath, { key })
    }
  }

  return nodes
}

export const FileExplorerTree: React.FC<Props> = props => {
  const classes = useStyles()
  const [nodes, setNodes] = useState({})
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [expandedKeys, setExpandedKeys] = useState([])
  const keyIds = []
  const treeRef = React.useRef<RcTree>()
  const keyCounters = {}

  const transformInTree = (nodes, startPath = "") => {
    return Object.keys(nodes)
      .map((key, i) => {
        if (key === "files" || key === "key") {
          return null
        }

        const files = nodes[key]?.files || []
        const keyId = uuidv4()
        keyIds.push(keyId)
        keyCounters[nodes.path] = keyCounters[nodes.path] ? keyCounters[nodes.path] + 1 : 0
        console.log(nodes[key]?.key || nodes.key || key)

        return {
          key: `${startPath}/${key}`,
          title: key,
          children:
            files.length > 0
              ? [...transformInTree(nodes[key], `${startPath}/${key}`), ...files.map(file => ({ key: `${startPath}/${file.key}`, title: file.filename, isLeaf: true }))]
              : transformInTree(nodes[key], `${startPath}/${key}`),
        }
      })
      .filter(node => !!node)
  }

  const treeData = useMemo(() => transformInTree(nodes), [nodes])
  console.log(nodes, treeData)
  useEffect(
    function setScrollPositionOnRerender() {
      if (treeData && treeRef?.current) {
        treeRef.current.scrollTo({ key: null, offset: lastScrollPosition + props.height, align: "bottom" })
      }
    },
    [treeData]
  )

  const [isReady, cancel] = useDebounce(
    () => {
      setNodes(convertPathsToNodes(props.paths))
    },
    200,
    [props.paths]
  )
  console.log(expandedKeys)

  return (
    <>
      {useMemo(
        () =>
          isReady() ? (
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
                onExpand={(expandedKeys, info) => {
                  console.log(info)
                  setExpandedKeys(expandedKeys)
                }}
              />
            </>
          ) : null,
        [treeData, isReady, expandedKeys, props.height]
      )}
    </>
  )
}

function Icon({ isFolder, isSelected }: any) {
  if (isFolder) {
    return <Folder />
  } else {
    return <InsertDriveFile />
  }
}

const useStyles = makeStyles((theme: Theme) => ({}))
