<template>
	<v-form class="pa-4" ref="form">
    <h2>你的昵称和性别</h2>
    <v-text-field
      label="昵称"
      v-model="form.name"
      class="mt-2"
      box
      :rules="[rules.nameRequired]"
      max="30">
    </v-text-field>
    <v-radio-group :rules="[rules.genderRequired]" v-model="form.gender" row>
      <v-radio color="pink" label="女" :value="false"></v-radio>
      <v-radio color="blue" label="男" :value="true"></v-radio>
    </v-radio-group>
    <v-btn color="primary" class="mt-2 ml-0" depressed round @click="submit()">下一步</v-btn>
  </v-form>
</template>

<style scoped>
</style>

<script>
  import Cookies from 'js-cookie'
	export default {
		name: "signup",
    data: ()=>({
      form:{
        name:'',
        gender:null
      },
      rules:{
        nameRequired: v => !!v || '请输入昵称',
        genderRequired: v => v != null || '请选择性别'
      }
    }),
    methods:{
      submit(){
        if (this.$refs.form.validate()){
          this.$axios.$post('/user/signup', this.form).then(res=>{
            Cookies.set('accessToken', res.data.token)
            this.$axios.setToken(res.data.token)
            this.$store.commit('setAuth', true)
            this.$router.push('/me')
          })
        }
      }
    }
	}
</script>
