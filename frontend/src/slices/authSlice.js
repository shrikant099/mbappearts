import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: localStorage.getItem('userdata')? JSON.parse(localStorage.getItem('userdata')) : null,
  loading: false,
  role:localStorage.getItem('role')? localStorage.getItem('role') : null,
  token:localStorage.getItem('token')? JSON.parse(localStorage.getItem('token')) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setUserData(state, value) {
      state.userData = value.payload;
      localStorage.setItem('userdata',JSON.stringify(value.payload))
      console.log("+.+.+.+.+.",state.userData);
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setRole(state,value){
      state.role = value.payload;
      localStorage.setItem('role',value.payload)
      console.log("role is : ",state.role)
    
    },
    setToken(state, value) {
      state.token = value.payload;
      localStorage.setItem('token',JSON.stringify(value.payload))
      console.log("Token:", state.token)
    },
  },
});

export const { setUserData, setLoading,setRole, setToken } = authSlice.actions;

export default authSlice.reducer;