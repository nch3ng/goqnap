const { series, src } = require('gulp');
const mocha = require('gulp-mocha');

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
  // body omitted
  cb();
}

// The `build` function is exported so it is public and can be run with the `gulp` command.
// It can also be used within the `series()` composition.
function runTest() {
  // body omitted
  return src([
      'server/tests/helper.spec.ts',
      'server/tests/auth.controller.spec.ts',
      'server/tests/courses.controller.spec.ts',
      'server/tests/users.controller.spec.ts',
      'server/tests/categories.controller.spec.ts'
      
    ])
    .pipe(mocha({
          reporter: 'nyan',
          require: ['ts-node/register'],
          timeout: 15000
      }));
}

exports.runTest = runTest;
exports.default = series(clean, runTest);

// gulp.task('run-tests', gulp.series([], function(){
//   return gulp.src('server/tests/test.spec.ts')
//         .pipe(mocha({
//             reporter: 'nyan',
//             require: ['ts-node/register']
//         }));
// }));

// gulp.task('default', [ 'run-tests' ]);