// import { useState, useEffect } from 'react'
// import axios from '../utils/axios'  // adjust path if your axios instance lives elsewhere

// // Built-in defaults for your app
// const DEFAULT_LOGOS = {
//   light: '/default-logo-light.png',
//   dark:  '/default-logo-dark.png',
// }
// const DEFAULT_COLORS = {
//   primary:   '#0055FF',
//   secondary: '#FFFFFF',
// }
// const DEFAULT_DARK_MODE = false

// export interface BrandingConfig {
//   logoLightUrl:    string
//   logoDarkUrl:     string
//   primaryColor:    string
//   secondaryColor:  string
//   defaultDarkMode: boolean
// }

// export function useBrandingConfig() {
//   const [logos,    setLogos]    = useState(DEFAULT_LOGOS)
//   const [colors,   setColors]   = useState(DEFAULT_COLORS)
//   const [darkMode, setDarkMode] = useState(DEFAULT_DARK_MODE)
//   const [loading,  setLoading]  = useState(true)

//   useEffect(() => {
//     axios
//       .get<BrandingConfig | null>('/setting/branding-config')
//       .then(({ data }) => {
//         if (data) {
//           setLogos({
//             light: data.logoLightUrl,
//             dark:  data.logoDarkUrl,
//           })
//           setColors({
//             primary:   data.primaryColor,
//             secondary: data.secondaryColor,
//           })
//           setDarkMode(data.defaultDarkMode)
//         }
//       })
//       .catch(err => {
//         console.error('Failed to load branding config:', err)
//       })
//       .finally(() => {
//         setLoading(false)
//       })
//   }, [])

//   return { logos, colors, darkMode, loading }
// }
