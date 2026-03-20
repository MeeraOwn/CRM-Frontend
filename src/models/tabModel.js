import { action, persist } from "easy-peasy";

const tabModel = {
  loginTime: sessionStorage.getItem("loginTime") || null,
  userName: sessionStorage.getItem("userName") || "",
  userRole: sessionStorage.getItem("userRole") || "",
  userId: sessionStorage.getItem("userId") || "",
  isAuthenticated: false,
  editEmployeeDetails: null,

  activeIndex: 0,
  fromBack: "",
  idCardScreen: false,

  moduleAccessComp: JSON.parse(localStorage.getItem("moduleAccessComp")) || "",

  setLoginTime: action((state, payload) => {
    state.loginTime = payload;
    sessionStorage.setItem("loginTime", payload);
  }),

  setUserName: action((state, payload) => {
    state.userName = payload;
    sessionStorage.setItem("userName", payload);
  }),

  setUserRole: action((state, payload) => {
    state.userRole = payload;
    sessionStorage.setItem("userRole", payload);
  }),

  setUserId: action((state, payload) => {
    state.userId = payload;
    sessionStorage.setItem("userId", payload);
  }),

  setIsAuthenticated: action((state, payload) => {
    state.isAuthenticated = payload;
  }),

  setEditEmployeeDetails: action((state, payload) => {
    state.editEmployeeDetails = payload;
  }),

  setActiveIndex: action((state, payload) => {
    state.activeIndex = payload;
  }),

  setFromBack: action((state, payload) => {
    state.fromBack = payload;
  }),
};

export default tabModel;
