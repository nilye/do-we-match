<template>
	<div class="text-xs-center">
    <v-btn color="primary" round depressed
           slot="activator"
           class="my-3"
           transition="dialog-bottom-transition"
           @click="newQuestionnaire">我要出卷子</v-btn>
    <v-list>
      <p class="text-xs-center" v-if="!results">空</p>
      <v-list-tile v-for="i in results" :key="i._id" :to="'/share?t=q&id='+i.id">
        <v-list-tile-content>{{i.name}}</v-list-tile-content>
        <v-list-tile-action>{{i.answers}}人回答</v-list-tile-action>
      </v-list-tile>
    </v-list>
  </div>
</template>

<script>
	export default {
		name: "me",
    middleware:['auth'],
    asyncData({app}){
		  return app.$axios.$get('/user/result').then(res=>{
		    return {
		      results:res.data
        }
      })
    },
    data: ()=>({
      newName:'',
      dialog:false
    }),
    methods:{
      newQuestionnaire(){
        this.$axios.$get('/q/create').then(res=>{
          this.$router.push('/create?id='+res.data.id)
        })
      }
    }
	}
</script>

<style scoped>

</style>
