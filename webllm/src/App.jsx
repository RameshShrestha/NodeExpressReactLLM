import { useState, useContext } from 'react'
import CenterContent from './Components/CenterContent'
import './index.css'
import Rightcontent from './Components/RightContent'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { DataContext } from './Dataprovider/DataContext'

function App() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const { theme } = useContext(DataContext);

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  // Theme-based color classes
  const themeClasses = {
    background: theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 to-black'
      : 'bg-gradient-to-br from-gray-800 to-gray-900',
    sidebar: theme === 'dark'
      ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700/50'
      : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/50',
    content: theme === 'dark'
      ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700/50'
      : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/50',
    button: theme === 'dark'
      ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600/30'
      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/30'
  };

  return (
    <>
      <div className={`flex min-h-screen ${themeClasses.background} p-4`}>
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleRightPanel}
          className={`
            fixed z-50
            ${themeClasses.button}
            text-white p-3
            rounded-xl shadow-2xl
            active:scale-95
            transition-all duration-300 ease-in-out
            border
            ${isRightPanelOpen
              ? 'top-6 left-[calc(20rem+0.5rem)] sm:left-[calc(21rem+0.5rem)]'
              : 'top-6 left-6'
            }
          `}
          aria-label="Toggle sidebar"
          title={isRightPanelOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {isRightPanelOpen ? <CloseIcon fontSize="medium" /> : <MenuIcon fontSize="medium" />}
        </button>

        {/* Left Sidebar */}
        {isRightPanelOpen && (
          <>
            <div className="w-80 sm:w-96 flex-shrink-0 transition-all duration-300 ease-in-out">
              <div className={`h-[calc(100vh-2rem)] ${themeClasses.sidebar} rounded-2xl shadow-2xl p-4 overflow-y-auto border`}>
                <Rightcontent />
              </div>
            </div>
            
            {/* Spacing between sidebar and content */}
            <div className="w-6 flex-shrink-0"></div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <div className={`h-[calc(100vh-2rem)] ${themeClasses.content} rounded-2xl shadow-2xl p-6 flex flex-col border`}>
            <CenterContent />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="myBanner">
        By: Ramesh Shrestha | Email: fx_ra@hotmail.com
      </div>
    </>
  )
}

export default App

// Made with Bob
