import { VFile } from 'vfile'
import { Parent } from 'unist'
import { visit } from 'unist-util-visit'
import { Heading } from 'mdast'
import GithubSlugger from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'

const slugger = new GithubSlugger()

export type TocItem = {
  value: string
  url: string
  depth: number
}

export type Toc = TocItem[]

/**
 * Extracts TOC headings from markdown file and adds it to the file's data object.
 */
export function remarkTocHeadings() {
  return (tree: Parent, file: VFile) => {
    const toc: Toc = []
    slugger.reset() // Reset slugger for a fresh start with no appended numbers
    visit(tree, 'heading', (node: Heading) => {
      const textContent = toString(node)
      toc.push({
        value: textContent,
        url: '#' + slugger.slug(textContent),
        depth: node.depth,
      })
    })
    file.data.toc = toc
  }
}

/**
 * Passes markdown file through remark to extract TOC headings
 *
 * @param {string} markdown
 * @return {*}  {Promise<Toc>}
 */
export async function extractTocHeadings(markdown: string): Promise<Toc> {
  const vfile = await remark().use(remarkTocHeadings).process(markdown)
  // @ts-ignore
  return vfile.data.toc
}
