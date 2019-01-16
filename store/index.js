export const state = () =>({
  isAuth: false,
  accessToken:''
})

export const mutations = {
  setAuth(state, payload){
    state.isAuth = payload
  },
  setToken(state, payload){
    state.accessToken = payload
  }
}

export const actions = {
  nuxtServerInit({commit}, ctx){
    if (process.server){
      if (ctx.req){
        let cookie = ctx.req.headers.cookie
        if (cookie){
          let tokenCookie = cookie.split(';').find(c=>c.trim().startsWith('accessToken'))
          let token = tokenCookie ? tokenCookie.split('=')[1] : false
          if (token) {
            ctx.app.$axios.setToken(token)
            commit('setToken', token)
            commit('setAuth', true)
          }
        }
      }
    }
  }
}
