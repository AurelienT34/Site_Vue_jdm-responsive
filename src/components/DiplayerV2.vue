<template>
  <div>
    <b-card v-if="relationsTriees.hasOwnProperty('raffinement sémantique') && relationsTriees['raffinement sémantique']['sortantes'].length > 0">
    <h4><b-badge variant="primary">Rafinnements sémantiques</b-badge></h4>
      <!-- trier les raffinements sémantiques par poids ? -->
      <b-spinner type="border" small v-if="show"></b-spinner>
      <span id="raf_sem_text" v-for="(value, index) in relationsTriees['raffinement sémantique']['sortantes']" v-bind:key="index">        
        <a v-on:click="prepareRequest(value[3][5])" v-if="value[3][2].includes('>')" v-bind:class="getClassPoids(value[5])">{{value[3][5]}}</a><a v-on:click="prepareRequest(value[3][2])" v-else>{{value[3][2]}}</a><b v-if="index < relationsTriees['raffinement sémantique']['sortantes'].length - 1"> • </b>
      </span>
    </b-card>
    <b-card class="mt-3">
       <div class="row">
         <div class="col-md-auto"><span style="font-size:4rem">{{mot}}</span></div>
         <div class="col">
          <span v-for="(value, name, index) in headerMot" v-bind:key="index">        
            <p id="relationHeaderMot" v-if="value"><b-badge variant="info" >{{name}}:</b-badge>  {{value}} </p>   
          </span>
         </div> 
        </div> 
    </b-card>
    <b-card no-body>
      <b-tabs pills card vertical>
        <b-tab title="Définition">
          <b-card-text id='defCardText'> 
              <p v-for="(item, index) in def" v-bind:key="index"> {{index + 1}}. <span v-html="item">
              </span></p>
          </b-card-text>

          <template v-slot:title>
              Définition
            </template>
        </b-tab>

        <div v-for="(value, name, index) in relationsTriees" v-bind:key="index">
          <b-tab>
            <b-card-text id="rel_card_text">
              <span v-for="(obj, index) in value['sortantes']" v-b-popover.hover.top="popoverMethod(obj)" v-bind:key="index" v-bind:class="getClassPoids(obj)">{{ getHTMLRelation(obj) }}<span v-if="index < value['sortantes'].length - 1"> • </span></span>
               <!-- {{ value }} -->
            </b-card-text>


            <template v-slot:title>
              {{name}} <b-badge variant="primary">{{value['sortantes'].length}}</b-badge>
            </template>

            <b-overlay :show.sync="show" no-wrap></b-overlay>
          </b-tab>
        </div>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "DisplayerV2",

  props: {
    show: Boolean,
    def: Array,
    relationsTriees: Object,
    mot: String,
    headerMot: Object,
    jsonPoids: Array
  },

  methods: {
    popoverMethod: function(o){
      return "ID: " + o[1] + ", Poids: " + o[5]
    },
    getClassPoids: function(r){
      let poids = parseInt(r[5])
      if(poids < 10){
        return "t1"
      }else if(poids < 25){
        return "t2"
      }else if(poids < 45){
        return "t3"
      }
      return "t4"
    },
    getHTMLRelation: function(r){
      // let poids = parseInt(r[5])
      // let t = ""
      // if(poids < 10){
      //   t = "t1"
      // }else if(poids < 25){
      //   t = "t2"
      // }else if(poids < 45){
      //   t = "t3"
      // }else{
      //   t = "t4"
      // }
      // if(Array.isArray(r[3])){
      //   if(r[3][2].includes('>')){
      //     return "<span class='" + t + "'>" + r[3][5] + "</span>"
      //   }
      //   return "<span class='" + t + "'>" + r[3][2] + "</span>"
      // } else {
      //   if(r[2][2].includes('>')){
      //     return "<span class='" + t + "'>" + r[2][5] + "</span>"
      //   }
      //   return "<span class='" + t + "'>" + r[2][2] + "</span>"
      // }

      if(Array.isArray(r[3])){
        if(r[3][2].includes('>')){
          return r[3][5]
        }
        return r[3][2]
      } else {
        if(r[2][2].includes('>')){
          return r[2][5]
        }
        return r[2][2]
      }
    },
    prepareRequest: function (text) {
        this.$emit("update-mot", text)
      },
  },
};
</script>

<style scoped>
#relationHeaderMot{
  text-align: left;
  margin-bottom: 0;
}
.t1{
  font-size: 60%;
}
.t2{
  font-size: 80%;
}
.t3{
  font-size: 100%;
}
.t4{
  font-size: 120%;
  font-weight: bold;
}
#raf_sem_text{
  white-space:nowrap;
}
#defCardText{
  text-align: left;
}
</style>