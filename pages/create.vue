<template>
  <div>
    <!--toolbar-->
    <v-toolbar color="primary" flat dark>
      <v-btn icon to="/me">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-items>
        <v-btn flat class="category" v-for="(value,key) in categories"
               :key="key" @click="acquire(key)">
          {{value}}
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-btn icon @click="sideBar = !sideBar">
        <v-badge color="red" overlap>
          <span slot="badge">{{length}}</span>
          <v-icon>description</v-icon>
        </v-badge>
      </v-btn>
    </v-toolbar>
    <!--sidebar-->
    <v-navigation-drawer
      v-model="sideBar"
      right fixed temporary>
      <v-list v-if="questionnaire.questions>0">
        <v-list-tile v-for="(q, index) in questionnaire.questions"
                     class="tile"
                     :key="q.question._id">
          <v-list-tile-content>{{q.question.subject}}</v-list-tile-content>
          <v-list-tile-action class="delete">
            <v-btn icon flat small color="red" @click="deleteQuestion(index)">
              <v-icon>cancel</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!--content-->
    <div class="pa-4">
      <p>题数：{{length+'/'+max}}</p>
      <div v-if="question && length < max">
        <h2>{{question.subject}}?</h2>
        <v-form ref="choices">
          <v-radio-group style="min-height: 148px" v-model="choice"
                         validate-on-blur
                         :rules="[v=> v!=null || '请选择答案后添加']">
            <v-radio v-for="(c,i) in question.choices" :key="c"
                     :label="c" :value="i" color="primary"></v-radio>
          </v-radio-group>
        </v-form>
        <v-btn class="ml-0" depressed round
               @click="acquire(activeCategory)">换一换</v-btn>
        <v-btn color="primary" depressed round
               @click="addQuestion()">添加</v-btn>
      </div>
      <v-btn v-else-if="length >= max"
             class="ml-0 mt-5" block
             color="primary" round depressed
             @click="publish()">发布</v-btn>
      <p v-else-if="!question">没有更多此类题目了，区别的类别看看吧！</p>
    </div>
  </div>
</template>

<style scoped>
  .category{min-width: 48px;padding:0px}
  .delete{display: none;}
  .tile:hover .delete{display: inherit;}
</style>

<script>
	export default {
		name: "create",
    asyncData({store, query, app}){
		  return app.$axios.$get('/q/pending?id='+query.id).then(res=>{
		    return {
		      questionnaire: res.data,
        }
      })
    },
    data: ()=>({
      categories: {
        'food': '食物',
        'brand': '品牌',
        'lifestyle': '生活',
        'entertainment': '娱乐'
      },
      activeCategory:'food',
      question:null,
      choice:null,
      lastId:'',
      max:7,
      sideBar:false
    }),
    created(){
		  this.acquire('food')
    },
    computed:{
		  length(){
		    return this.questionnaire.questions.length || 0
      }
    },
    methods:{
		  acquire(category){
		    this.activeCategory = category
		    this.$axios.$get(`/q/acquire?qn=${this.questionnaire.id}&c=${category}&l=${this.lastId}`).then(res=>{
		      this.lastId = res.data ? res.data._id : ''
		      this.question = res.data
          this.choice = null
        })
      },
      deleteQuestion(index){
		    this.questionnaire.questions.splice(index, 1)
        this.updateChanges()
        if (this.length < this.max) this.acquire(this.activeCategory)
      },
      addQuestion(){
		    if (this.$refs.choices.validate()){
          this.questionnaire.questions.push({
            choice:this.choice,
            question: this.question
          })
          this.acquire(this.activeCategory)
          this.updateChanges()
        }
      },
      updateChanges(){
        this.$axios.$post('/q/edit', {
          id:this.questionnaire.id,
          questions: this.questionnaire.questions.map(q=>({
            question: q.question._id, choice:q.choice
          }))
        }).then(res=>{

        })
      },
      publish(){
		    this.$axios.$post('/q/edit',{
		      id:this.questionnaire.id,
          isPublished:true
        }).then(res=>{})
		    this.$router.push('/share?t=q&id='+this.questionnaire.id)
      }
    }
	}
</script>

