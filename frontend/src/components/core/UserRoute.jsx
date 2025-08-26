import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function UserRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const {role} = useSelector((state) => state.auth)

  if (token !== null && role === 'user') {
    return children
  } else {
    return <Navigate to="/login" />
  }
}

export default UserRoute