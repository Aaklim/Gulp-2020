
const project_folder='dist';
const source_folder='src';

const path={
    build:{
        html: project_folder +'/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src:{
        html: source_folder +'/index.html',
        scss: source_folder + '/scss/style.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/*',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch:{
        html: source_folder +'/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + 'img/**/*.(jpg|png|svg|gif|ico|webp)',

    },
    clean:'./' + project_folder + '/',
}

const {src,dest,watch,parallel,series}=require('gulp'),
    browserSync =require('browser-sync').create(),
    fileInclude=require('gulp-file-include'),
    del =require('del'),
    sass=require('gulp-sass'),
    autoprefixer=require('gulp-autoprefixer'),
    groupMedia=require('gulp-group-css-media-queries'),
    cleanCss=require('gulp-clean-css'),
    rename=require('gulp-rename'),
    concat=require('gulp-concat'),
    uglify=require('gulp-uglify-es').default,
    babel =require('gulp-babel'),
    imagemin=require('gulp-imagemin'),
    htmlmin=require('gulp-htmlmin')


    function sync (){
        browserSync.init({
            server:{
                baseDir:'./' + project_folder + '/',
            },
            port:3000,
            notify:false
        })
        watch(path.watch.html,series(html))
        watch(path.watch.css,series(scss))
        watch(path.watch.js,series(js))
        watch(path.watch.img,series(images))
    }

    function clean(){
        return del(path.clean)
    }

    function html (){
        return src(path.src.html)
        .pipe(fileInclude())
        .pipe(dest(path.build.html))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(rename({
          extname:'.min.html'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
    }

    function scss(){
        return src(path.src.scss)
          .pipe(
            sass({
              outputStyle: 'expanded',
            })
          )
          .pipe(
              groupMedia()
              )
          .pipe(
            autoprefixer({
              overrideBrowserslist: ['last 5 versions'],
              cascade: true,
            })
          )
          .pipe(dest(path.build.css))
          .pipe(cleanCss())
          .pipe(
              rename({
                  extname:'.min.css'
              }))
          .pipe(dest(path.build.css))
          .pipe(browserSync.stream());
    }

    function js(){
        return src(path.src.js)
          .pipe(
            babel({
              presets: ['@babel/preset-env'],
            })
          )
          .pipe(concat('index.js'))
          .pipe(dest(path.build.js))
          .pipe(uglify())
          .pipe(
            rename({
              extname: '.min.js',
            })
          )
          .pipe(dest(path.build.js))
          .pipe(browserSync.stream())
    }

    function images() {
      return src(path.src.img)
        .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}),
          imagemin.svgo({
            plugins: [
              {removeViewBox: false},
              {cleanupIDs: false}
            ]
          })
        ]))
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream());
    }


    exports.start=series(clean,parallel(scss,js,images),html,sync);
    exports.clean=clean;
