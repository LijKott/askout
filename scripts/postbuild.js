// Runs after each site's workspace build (which writes into dist/<site>/).
// Adds the two things a single-domain, multi-site GitHub Pages deploy needs
// on top of that: a CNAME file for the custom domain, and a root landing
// page linking out to whichever sites currently exist under dist/.
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const distDir = join(root, 'dist')
const domain = 'askout.elijahkott.com'

mkdirSync(distDir, { recursive: true })

writeFileSync(join(distDir, 'CNAME'), `${domain}\n`)
writeFileSync(join(distDir, '.nojekyll'), '')

const sites = readdirSync(distDir).filter((name) => {
  if (name.startsWith('.') || name === 'CNAME') return false
  return statSync(join(distDir, name)).isDirectory()
})

const links = sites
  .sort()
  .map((site) => `      <li><a href="/${site}/">${domain}/${site}</a></li>`)
  .join('\n')

writeFileSync(
  join(distDir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>askout</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #3d0d16;
        color: #f3e8ce;
        font-family: system-ui, sans-serif;
      }
      ul {
        list-style: none;
        padding: 0;
        text-align: center;
      }
      a {
        color: #f2c14e;
        font-size: 1.25rem;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <ul>
${links}
    </ul>
  </body>
</html>
`,
)

console.log(`postbuild: wrote CNAME (${domain}) and index for ${sites.length} site(s): ${sites.join(', ') || '(none)'}`)
