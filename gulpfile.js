
const gulp = require('gulp');
const zip = require('gulp-zip');
var ftp = require('vinyl-ftp');
var del = require('del');


const config = require('./deployconfig.json');

function copy() { 
    return gulp.src(['folder/**',
                     '**.js',   
                     'file.json'],    
          {
            base: './',
            ignore: ['folder/folder/**',   //Apaga a pasta raiz e todo o conteudo						        				           
                     'folder/*/**',        //Apaga todo o conteudo da pasta raiz mas nao apaga a pasta raiz            
                     '**.git']

          }).pipe(gulp.dest('dist/fontes'));
}

function compress() { 
   let today = new Date().toISOString().replace(/-/g, '').slice(0, 8);

   return  gulp.src('dist/fontes/**')
            .pipe(zip(today + '/' + config.sistema + today + '.zip'))
            .pipe(gulp.dest('dist/zip'));
}

function sendToFtp() { 
    let conn = ftp.create( {
        host:     config.ftp.host,
        port:     config.ftp.port,
        user:     config.ftp.user,
        password: config.ftp.password,                
    });
    
    let folder = process.env.NODE_ENV == 'production' ? 'producao' : 'homologacao';

    return gulp.src( ['dist/zip/**'] , {  buffer: false } )
        .pipe( conn.dest( config.ftp.path + '/' + folder ) );      
}

function clean() { 
    return del(['dist'], {force:true});     
}

exports.copy = gulp.series(clean, copy);
exports.deployftp = gulp.series(compress, sendToFtp, clean);
exports.deploy = gulp.series(clean, copy, compress, sendToFtp, clean);