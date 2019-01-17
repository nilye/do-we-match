<template>
  <div>
    <v-toolbar color="primary" flat dark>
      <h3>{{active+1}}/{{questionnaire.questions.length}}</h3>
      <v-spacer></v-spacer>
      <v-btn icon @click="sideBar = !sideBar">
        <v-icon>description</v-icon>
      </v-btn>
    </v-toolbar>
    <!--sidebar-->
    <v-navigation-drawer
      v-model="sideBar"
      right fixed temporary>
      <v-list>
        <v-list-tile v-for="(q, index) in questionnaire.questions"
                     class="tile"
                     @click="active = index;sideBar = false"
                     :key="q.question._id">
          <v-list-tile-content>{{q.question.subject}}</v-list-tile-content>
          <v-list-tile-action
            v-if="answers[index] != null">
            <v-icon color="success">check</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <div class="pa-4">
      <v-tabs-items v-model="active">
        <v-tab-item v-for="(q, qIndex) in questionnaire.questions" :key='qIndex'>
          <h2>{{q.question.subject}}?</h2>
          <v-form ref="choices">
            <v-radio-group v-model="answers[qIndex]"
                           validate-on-blur
                           :rules="[v=> v!=null || '请选择答案后添加']">
              <v-radio v-for="(c,cIndex) in q.question.choices" :key="c"
                       :label="c" :value="cIndex" color="primary"></v-radio>
            </v-radio-group>
          </v-form>
          <v-btn class="ml-0 mt-5" depressed round color="primary"
                 v-if="!completed"
                 :disabled="answers[qIndex] == null"
                 @click="nextQuestion()">下一题</v-btn>
          <v-btn class="ml-0 mt-5" depressed round color="primary"
                 v-else
                 @click="submit()">提交</v-btn>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>

<script>
	export default {
		name: "q-pg",
    asyncData({store, query, app}){
		  return app.$axios.$get('/q/questionnaire?id='+query.id).then(res=>{
		    return {
		      questionnaire:res.data,
          answers:res.data.questions.map(()=>null)
        }
      })
    },
    data: ()=>({
      active:0,
      sideBar:false
    }),
    created(){

    },
    computed:{
      length(){
        return this.questionnaire.questions.length || 0
      },
      completed(){
        return this.answers.filter(i=>i == null).length === 0
      }
    },
    methods:{
		  nextQuestion(){
		    this.active ++
      },
      submit(){
		    let level, score = 0
		    for (let i in this.questionnaire.questions){
		      let question = this.questionnaire.questions[i].question
		      let isMatch = this.questionnaire.questions[i].choice === this.answers[i]
          if (isMatch === question.shouldMatch) score ++
        }
        this.$axios.$post('/q/answer',{
          id:this.questionnaire.id,
          answers:this.answers,
          score:score
        }).then(res=>{
           this.$router.push(`/share?t=s&q=${this.questionnaire.id}&a=${res.data.id}`)
        })
      }
    }
	}
</script>

<style scoped>

</style>
