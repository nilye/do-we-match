export default ({store, route, redirect})=>{
  console.log(route)
  if (!store.state.isAuth){
    return redirect('/signup?redirect='+route.fullPath)
  }
}
