import { defaultTheme } from 'evergreen-ui'
import { merge } from 'lodash'

const appTheme = merge({}, defaultTheme, {
  typography: {
    fontFamilies: {
      display: 'Lato, sans-serif',
      ui: 'Lato, sans-serif',      
      mono: '"SF Mono", monospace'
    }
  },
  components: {
    Text: {
      baseStyle: {
        fontFamily: 'Lato, sans-serif'
      }
    },
    Heading: {
      baseStyle: {
        fontFamily: 'Lato, sans-serif'
      }
    },
    Link: {
      baseStyle: {
        fontFamily: 'Lato, sans-serif'
      }
    }
  }
})

export default appTheme