import { definePreset } from 'unocss'

export const presetPep = definePreset(() => {
  return {
    name: '@pep/preset-pep',
    theme: {
      colors: {
        pep: {
          primary: 'var(--color-pep-primary)',
          secondary: 'var(--color-pep-secondary)',
          white: 'var(--color-pep-white)',
          gray: {
            100: 'var(--color-pep-gray-100)',
            200: 'var(--color-pep-gray-200)',
            600: 'var(--color-pep-gray-600)',
          }
        }
      },
      spacing: {
        'pep-xs': 'var(--spacing-pep-xs)',
        'pep-sm': 'var(--spacing-pep-sm)',
        'pep-md': 'var(--spacing-pep-md)',
        'pep-lg': 'var(--spacing-pep-lg)',
        'pep-xl': 'var(--spacing-pep-xl)',
        'pep-2xl': 'var(--spacing-pep-2xl)',
      },
      fontSize: {
        'pep-xs': 'var(--typography-pep-size-xs)',
        'pep-sm': 'var(--typography-pep-size-sm)',
        'pep-base': 'var(--typography-pep-size-base)',
        'pep-lg': 'var(--typography-pep-size-lg)',
        'pep-xl': 'var(--typography-pep-size-xl)',
      }
    },
    shortcuts: [
      {
        'pep-card': 'bg-pep-white p-pep-lg shadow-sm rounded-1 border border-pep-gray-200 transition-all duration-300 hover:(-translate-y-1 shadow-md)',
        'pep-btn-base': 'inline-flex items-center justify-center px-pep-md py-pep-sm rounded-sm cursor-pointer transition-all duration-200 border border-transparent text-pep-sm',
        'pep-btn-primary': 'pep-btn-base bg-pep-secondary text-pep-white hover:bg-pep-gray-600',
        'pep-btn-secondary': 'pep-btn-base bg-pep-white border-pep-secondary text-pep-secondary hover:bg-pep-gray-100',
        'pep-btn-ghost': 'pep-btn-base bg-transparent text-pep-secondary hover:underline',
        'pep-tab-item': 'bg-transparent border-none py-pep-sm px-0 text-pep-sm text-pep-gray-600 cursor-pointer relative transition-colors duration-200 hover:text-pep-primary',
        'pep-tab-item-active': 'text-pep-primary font-600 after:(content-[""] absolute bottom-0 left-0 w-full h-2px bg-pep-primary)',
        'pep-tag': 'text-pep-xs px-pep-xs py-1px bg-pep-gray-200 text-pep-gray-600 rounded-sm',
      }
    ]
  }
})
