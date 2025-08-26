import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)

  const {role} = useSelector((state)=>state.auth)

  if (token === null) {
    return children
  } else {
    return (role === 'user' ? <Navigate to="/" /> : <Navigate to="/admindashboard"/>)
  }
}

export default OpenRoute