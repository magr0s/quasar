const packageName = 'material-design-icons'

// ------------

const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

let skipped = []
const dist = resolve(__dirname, `../material-icons/index.js`)

const svgFolder = resolve(__dirname, `../node_modules/${packageName}/`)
const svgFiles = glob.sync(svgFolder + '/*/svg/production/ic_*_24px.svg')

function extract (file) {
  const content = readFileSync(file, 'utf-8')

  const name = ('mat_' + file.match(/ic_(.*)_24px\.svg/)[1])
    .replace(/(_\w)/g, m => m[1].toUpperCase())

  try {
    const dPath = content.match(/ d="([\w ,\.-]+)"/)[1]
    const viewBox = content.match(/viewBox="([0-9 ]+)"/)[1]

    return `export const ${name} = '${dPath}${viewBox !== '0 0 24 24' ? `|${viewBox}` : ''}'`
  }
  catch (err) {
    skipped.push(name)
    return null
  }
}

function getBanner () {
  const { version } = require(resolve(__dirname, `../node_modules/${packageName}/package.json`))
  return `/* Google Material Design Icons v${version} */\n\n`
}

const svgExports = new Set()

svgFiles.forEach(file => {
  svgExports.add(extract(file))
})

writeFileSync(dist, getBanner() + Array.from(svgExports).filter(x => x !== null).join('\n'), 'utf-8')

if (skipped.length > 0) {
  console.log(`material icons - skipped (${skipped.length}): ${skipped}`)
}
