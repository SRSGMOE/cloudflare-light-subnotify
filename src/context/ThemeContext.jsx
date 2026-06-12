import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = {
  default: {
    name: '默认主题',
    description: '蓝白色调，简洁现代',
    preview: {
      primary: '#4A90D9',
      bg: '#FFFFFF',
      text: '#1F1F1F',
    }
  },
  'animal-forest': {
    name: '动物森林',
    description: '温暖自然，可爱风格',
    preview: {
      primary: '#19c8b9',
      bg: '#f8f8f0',
      text: '#794f27',
    }
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'animal-forest'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  const value = {
    currentTheme,
    setTheme,
    themes,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}