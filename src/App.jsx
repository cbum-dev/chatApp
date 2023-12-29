import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import PrivateRoutes from './utils/PrivateRoutes'
import Room from './pages/Room'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from './utils/AuthContext'
import New from './pages/Personal'
import Gpt from './pages/App'
import Chatting from './pages/Chatting'
function App() {


  return (
    
      <Router>
        
        <AuthProvider>
          
          <Routes>
              <Route path="/gpt" element={<Gpt/>}/>

              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/register" element={<RegisterPage/>}/>
                <Route element={<PrivateRoutes/>}>
                    <Route path="/" element={<Room/>}/>
                </Route>
                <Route path="/chat" element={<New/>}/>
                <Route path="/chat/:messageId" element={<Chatting/>}/>

          </Routes>
        </AuthProvider>
      </Router>
    
  )
}

export default App
