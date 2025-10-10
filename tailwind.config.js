/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html','./public/**/*.js'],
  theme: {
    extend: {
      colors:{ brand:{ yellow:'#fde047', black:'#0a0f14'} }
    }
  },
  safelist:[
    // pills/badges we toggle in JS
    'ring-2','ring-yellow-400','bg-yellow-300','text-black',
    'bg-zinc-900/70','border-zinc-800','border-zinc-600',
    'rounded-xl','rounded-lg','rounded-full'
  ]
};
