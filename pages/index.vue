<template>
  <div style="display: flex;align-items: center;flex-direction: column;height: 100vh;">
    <img style="max-width: 75%" src="logo-01.png">
    <h3 class="my-3">通过回答选择题来看看你和TA有没有默契！</h3>
    <v-spacer></v-spacer>
    <v-btn depressed color="primary" round
           class="mb-5"
           @click="start()">开始游戏</v-btn>
  </div>
</template>

<style scoped>
</style>

<script>
  export default {
    methods:{
      start(){
        this.$router.push(this.$store.state.isAuth?'/me':'/signup')
      }
    }
  }
</script>
