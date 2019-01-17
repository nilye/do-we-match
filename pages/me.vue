<template>
	<div class="text-xs-center">
    <v-dialog fullscreen hide-overlay v-model="dialog"
              class="my-3">
      <v-btn color="primary" round depressed
             slot="activator"
             transition="dialog-bottom-transition"
             @click="newQuestionnaire">我要出卷子</v-btn>
      <v-card>
        <div class="pa-4 text-xs-right">
          <v-text-field v-model="newName" box required
                        :rules="[v=>!!v||'必填']"
                        label="添加卷子名称备注"></v-text-field>
          <v-btn round depressed @click="dialog=false">取消</v-btn>
          <v-btn round color="primary" depressed @click="newQuestionnaire">确定</v-btn>
        </div>
      </v-card>
    </v-dialog>
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
        if (!!this.newName.trim()){
          this.$axios.$post('/q/create', {
            name: this.newName
          }).then(res=>{
            this.$router.push('/create?id='+res.data.id)
          })
        }
      },
      rowClick(row){
        console.log(row.id)
      }
    }
	}
</script>

<style scoped>

</style>
