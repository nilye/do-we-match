<template>
  <div class="pa-4">
    <img style="max-width: 75%" class="d-block mx-auto"
         src="logo-01.png">
    <!--share questionnaire-->
    <div v-if="query.t === 'q'" class="text-xs-center mt-5">
      <h1>{{questionnaire.owner.name}} </h1>
      <h2>邀请你参与默契大作战</h2>
      <div v-if="questionnaire.isOwner" class="mt-5">
        <div>
          使用浏览器分享按钮
          "<v-icon>share</v-icon>
          <v-icon>more_horiz</v-icon>"
          把此页面分享给你的朋友吧！
        </div>
        <v-btn round depressed color="primary"
               class="mt-4"
               to="/me">返回主页</v-btn>
      </div>
      <v-btn v-else color="primary" round depressed
             class="mt-5"
             @click="$router.push('/q?id='+query.id)">开始游戏</v-btn>
    </div>
    <div v-if="query.t === 's' && score.calculated" class="text-xs-center">
      <h2 class="mt-4">你与
        <span>"{{questionnaire.owner.name}}"</span>
        的默契度为
      </h2>
      <h1 class="my-2 score">{{score.percent}}%</h1>
      <h2 style="white-space: pre-wrap;"><i>"{{score.msg}}"</i></h2>
      <v-btn class="mt-5" color="primary" depressed round
             @click="$router.push('/me')">我要出题</v-btn>
    </div>
  </div>
</template>

<script>
	export default {
		name: "share",
    head(){
		  return {
        title: this.query.t === 'q' ? this.questionnaire.owner.name+'邀请你参与默契大作战' : `我与${this.questionnaire.owner.name}的默契度为${this.score.percent}% - 默契大作战`
      }
    },
    asyncData({query, app}){
      let queries = Object.keys(query).map(key=>`${key}=${query[key]}`).join('&')
		  return app.$axios.$get('/q/questionnaire?'+queries).then(res=>{
		    return {
		      query:query,
		      questionnaire:res.data
        }
      })
    },
    data: ()=>({
      score:{
        calculated:false,
        corrects:null,
        level:null,
        msg:"",
        percent:null
      }
    }),
    created(){
      if (this.query.t === 's') {
		    this.score.corrects = this.questionnaire.answers.score
        this.score.level = (()=>{
         if (this.score.corrects<3) return 0
         else if (this.score.corrects < 6) return 1
         else return 2
        })()
        this.score.percent = Math.round(this.score.corrects/7*100)
        const msg = [
          ["这么互补也不容易", "人都是折翼的天使，\nTA是你的另一个翅膀", "你们确定要在一起吗","会打起来的吧"],
          ["平平淡淡才是真","若即若离也还行","君子之交淡如水"],
          ["简直是天作之合啊","一定要牵手","绝对是老铁啊"]
        ]
        const index = this.score.level
        this.score.msg = msg[index][Math.floor(Math.random()*index)]
        this.score.calculated = true
      }
    }
	}
</script>

<style scoped>
.score{color:#FFBB21;font-size:56px}
</style>
