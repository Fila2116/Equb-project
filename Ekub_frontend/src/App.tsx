import Login from "./components/auth/Login";
import React from 'react'
// import { useBrandingConfig } from "./hooks/userBrandingConfig";


const App: React.FC = () => {
  return <Login />;
};
export default App;



// function App() {
//   const { logos, colors, darkMode, loading } = useBrandingConfig()

//   if (loading) {
//     return <div>Loading…</div>
//   }

//   return (
//     <div
//       className={darkMode ? 'dark' : ''}
//       style={{
//         '--color-primary': colors.primary,
//         '--color-secondary': colors.secondary,
//       } as React.CSSProperties}
//     >
//       <header className="p-4 bg-[var(--color-primary)] text-white flex items-center">
//         <img
//           src={darkMode ? logos.dark : logos.light}
//           alt="Logo"
//           className="h-8 mr-4"
//         />
//         <h1 className="text-xl">Ekub Admin Dashboard</h1>
//       </header>

//       {/* Your existing routes/components go here */}

//     </div>
//   )
// }

// export default App