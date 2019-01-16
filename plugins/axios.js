export default ({store, app}) => {
  console.log(store.state.accessToken)
  app.$axios.setToken(store.state.accessToken)
}
