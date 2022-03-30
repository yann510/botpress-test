import "antd/dist/antd.css"

import { Folder, InsertDriveFile } from "@mui/icons-material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { TreeItem, TreeView } from "@mui/lab"
import { Button, Theme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import { Tree } from "antd"
import DirectoryTree from "antd/lib/tree/DirectoryTree"
import { clone, get, set, trimEnd } from "lodash"
import RcTree from "rc-tree"
import React, { useEffect, useMemo, useState } from "react"
import { NodeRendererProps } from "react-arborist/dist/types"
import { useDebounce } from "react-use"
import { v4 as uuidv4 } from "uuid"

interface Node {
  id: string
  children?: Node[]
  isOpen?: boolean
}

interface Props {
  paths: string[]
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

  for (const path of paths) {
    // Only supports basic UNIX paths

    const objectPath = getObjectPath(path)

    const isFile = path.includes(".")
    if (isFile) {
      const filename = path.replace(/^.*[\\/]/, "")
      const fileDirectoryObjectPath = trimEnd(objectPath.replace(filename, ""), ".")
      const newFileIndex = (get(nodes, `${fileDirectoryObjectPath}.files`) || []).length

      set(nodes, `${fileDirectoryObjectPath}.files[${newFileIndex}]`, {filename)
    } else {
      set(nodes, objectPath, {})
    }
  }

  return nodes
}

export const FileFolderTree: React.FC<Props> = props => {
  const classes = useStyles()
  const [nodes, setNodes] = useState({})
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [expandedKeys, setExpandedKeys] = useState([])
  const keyIds = []
  const treeRef = React.useRef<RcTree>()

  const transformInTree = nodes => {
    return Object.keys(nodes)
      .map((key, i) => {
        if (key === "files") {
          return null
        }

        const files = nodes[key]?.files || []
        const keyId = uuidv4()
        keyIds.push(keyId)

        return {
          key: keyId,
          title: key,
          children:
            files.length > 0
              ? [...transformInTree(nodes[key]), ...files.map(file => ({ key: uuidv4(), title: file, isLeaf: true }))]
              : transformInTree(nodes[key]),
        }
      })
      .filter(node => !!node)
  }

  const treeData = useMemo(() => transformInTree(nodes), [nodes])
  useEffect(
    function setScrollPositionOnRerender() {
      if (treeData && treeRef?.current) {
        treeRef.current.scrollTo({ key: null, offset: lastScrollPosition + 500, align: "bottom" })
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

  return (
    <>
      {useMemo(
        () =>
          isReady() ? (
            <>
              <DirectoryTree
                ref={treeRef}
                treeData={treeData}
                height={500}
                defaultExpandAll
                defaultExpandParent
                itemHeight={28}
                expandedKeys={expandedKeys}
                onScroll={() => {
                  const listElement: any = document.getElementsByClassName("ant-tree-list-holder-inner")[0]
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
        [treeData, isReady, expandedKeys]
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
