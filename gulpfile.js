const gulp = require('gulp')
const ts = require('gulp-typescript')
const spawn = require('child_process').spawn
let node

async function startServer() {
  if (node) { node.kill() }
  node = await spawn("node", ["./dist/server.js"], { stdio: "inherit" })

  node.on("close", function (code) {
    if (code === 8) {
      console.log("Error detected, waiting for changes...")
    }
  })
}

// Pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json')

var otherfiles = [
  './src/assets/*.*'
]

gulp.task('killServer', (resolve) => {
  if (node) { node.kill() }
  resolve()
})

gulp.task('assets', () => {
  return gulp.src(otherfiles)
    .pipe(gulp.dest('dist/assets'))
})

gulp.task('scripts', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('dist'))
})

gulp.task('startServer', () => {
  return startServer()
})

// Start or develop, with watcher

gulp.task('start', gulp.series('killServer', 'assets', 'scripts', 'startServer'))

gulp.task('develop', 
  gulp.series('killServer', 'assets', 'scripts', 'startServer'), 
  () => {
    gulp.watch(['src/assets/*.*', 'src/**/*.ts'], gulp.series('killServer', 'assets', 'scripts', 'startServer'))
})

process.on('exit', () => {
  if (node) {
    node.kill()
  }
})