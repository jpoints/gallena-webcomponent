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
            colors: {
              black: '#000000',
              white: '#FFFFFF',
              primary: '#0a1e30',
              secondary: '#2B5B82',
              gray: {
                '50': '#F1F5FB',
                '100': '#E1E4E8',
                '200': '#C2C9D2',
                '300': '#A4AFBB',
                '400': '#8594A5',
                '500': '#67798E',
                '600': '#526172',
                '700': '#3E4955',
                '800': '#293039',
                '900': '#15181C'
              }
            },
            backgroundColor: {
              secondary: '#2B5B82',
              gray: {
                '50': '#F1F5FB',
                '100': '#E1E4E8',
                '200': '#C2C9D2',
                '300': '#A4AFBB',
                '400': '#8594A5',
                '500': '#67798E',
                '600': '#526172',
                '700': '#3E4955',
                '800': '#293039',
                '900': '#15181C'
              },
              white: '#FFFFFF',
              black: '#000000',
              primary: '#0a1e30',
              default: '#FFFFFF'
            },
            textColor: {
              secondary: '#2B5B82',
              gray: {
                '50': '#F1F5FB',
                '100': '#E1E4E8',
                '200': '#C2C9D2',
                '300': '#A4AFBB',
                '400': '#8594A5',
                '500': '#67798E',
                '600': '#526172',
                '700': '#3E4955',
                '800': '#293039',
                '900': '#15181C'
              },
              white: '#FFFFFF',
              black: '#000000',
              primary: '#0a1e30',
              default: '#1A202C',
              link: '#006eff'
            },
            borderColor: {
              secondary: '#2B5B82',
              gray: {
                '50': '#F1F5FB',
                '100': '#E1E4E8',
                '200': '#C2C9D2',
                '300': '#A4AFBB',
                '400': '#8594A5',
                '500': '#67798E',
                '600': '#526172',
                '700': '#3E4955',
                '800': '#293039',
                '900': '#15181C'
              },
              white: '#FFFFFF',
              black: '#000000',
              primary: '#0a1e30',
              default: '#FF5C38'
            },
            borderRadius: {
              DEFAULT: '0.25rem',
              sm: '0.125rem',
              lg: '0.5rem',
              xl: '0.75rem',
              full: '9999px'
            },
            borderWidth: { '2': '2px', '4': '4px', '8': '8px', DEFAULT: '1px' },
            boxShadow: {
              DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
              sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
              lg: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              xl: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
            },
            fontFamily: {
              body: [ 'Helvetica', 'Arial', 'Sans-Serif' ],
              heading: [ 'Helvetica', 'Arial', 'Sans-Serif' ]
            },
            fontSize: {
              base: '1rem',
              xs: '.75rem',
              sm: '.875rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem',
              '4xl': '2.25rem',
              '5xl': '3rem',
              '6xl': '3.75rem',
              '7xl': '4.5rem',
              '8xl': '6rem',
              '9xl': '8rem'
            },
            fontWeight: {
              light: 300,
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700,
              black: 900
            },
            letterSpacing: { tight: '-0.025em', normal: '0em', wide: '0.025em' },
            lineHeight: {
              none: 1,
              tight: 1.25,
              snug: 1.375,
              normal: 1.5,
              relaxed: 1.625,
              loose: 2
            },
            screens: { sm: '640px', md: '768px', lg: '1024px' }
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
        fs.writeFile('./public/omni-cms/main.css', result.css, () => true);
        let test = result.css.match(/(?:[\.]{1})([a-zA-Z_]+[\w-_]*)(?:[\s\.\,\{\>#\:]{0})/igm).join("").split(".").join("\n");
        fs.writeFile('./public/omni-cms/class-list.txt', test, () => true);
        if ( result.map ) {
            fs.writeFile('./public/omni-cms/main.css.map', result.map.toString(), () => true)
        }
        console.log("Tailwind complete");
    })

}

export default run_tailwind;