import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )
    expect(document.getElementById('root') || document.body).toBeTruthy()
  })
})
