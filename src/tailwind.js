import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import postcss from 'postcss';
import precss from 'precss';
import cssnano from 'cssnano';
import fs from 'fs'
import path from 'path'

let css = fs.readFileSync(path.resolve(__dirname, './src/tailwind.css'), 'utf8');

let tailwindconfig = {
    purge:  {
        enabled: true,
        content: [
            'src/**/*','public/**/*.html'
        ],
        skiplist:['./public/app.css','./public/build/'],
        safelist: []
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
          extend:{
            colors:{
              background:"#AA5C39",
              primary:"#2f506c",
              secondary:"#6091ba",
              dog:"#44AABB"
            },
            maxWidth:{
              '8xl':"100rem"
            },
            minHeight:{
              'content':"50%"
            },
          },
          fontFamily:{
            sans:['Open Sans', 'arial','sans-serif']
          }
    },
    variants: {
      extend: {},
    },
    plugins: [],
  }  

function run_tailwind(purge) {
    if(!purge){
      tailwindconfig.purge.enabled = false;
    }
    console.log(`Running Tailwind, purge : ${purge}`, JSON.stringify(tailwindconfig));
    postcss([precss, tailwindcss(tailwindconfig), autoprefixer, cssnano])
    .process(css, { from:'./src/custom.css', to: './dest/app.css' })
    .then(result => {
        fs.writeFile('./public/app.css', result.css, () => true);
        let test = result.css.match(/(?:[\.]{1})([a-zA-Z_]+[\w-_]*)(?:[\s\.\,\{\>#\:]{0})/igm).join("").split(".").join("\n");
        fs.writeFile('./public/class-list.txt', test, () => true);
        if ( result.map ) {
            fs.writeFile('./public/app.css.map', result.map.toString(), () => true)
        }
        console.log("Tailwind complete");
    })

}

export default run_tailwind;