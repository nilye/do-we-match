<template>
	<v-container class="text-xs-center">
    <v-dialog fullscreen hide-overlay v-model="dialog">
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
      <v-list-tile v-for="i in table" :key="i.id">
        {{i.name}}
      </v-list-tile>
    </v-list>
  </v-container>
</template>

<script>
	export default {
		name: "me",
    validate({store}){
		  return store.state.isAuth
    },
    data: ()=>({
      table: [
        {name:'题目备注', id:'fRGNVQ'},
        {name:'题目备注', id:'fRre34'}
      ],
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
