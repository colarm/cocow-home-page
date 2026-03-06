import Home from './components/home'
import LoginCallback from './components/LoginCallback'
import { redirectToSso } from './api'

export default function App() {
  if (window.location.pathname === '/login/callback') {
    return <LoginCallback />
  }

  return <Home onLoginClick={redirectToSso} />
}
