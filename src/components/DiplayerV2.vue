<template>
  <div>
    <b-card v-if="relationsTriees != null && relationsTriees.hasOwnProperty('raffinement sémantique') && relationsTriees['raffinement sémantique'].length > 0">
    <h4><b-badge variant="primary">Raffinements sémantiques</b-badge></h4>
        <b-card-text>
          <span class="mouseHighlight" id="raf_sem_text" v-for="(value, index) in relationsTriees['raffinement sémantique']" v-bind:key="index">        
            <a id='whitespace' v-on:click="prepareRequest(value[0])" v-bind:class="getClassPoids(value)">{{value[0]}}</a>
            <!-- <b v-if="index < relationsTriees['raffinement sémantique'].length - 1"> • </b> -->
          </span>
        </b-card-text>
    </b-card>
    <b-card class="mt-3x">
       <div class="row">
         <div class="col-md-auto"><span style="font-size:4rem; text-align:justify;">{{mot}}</span></div>
         <div class="col">
          <span v-for="(value, name, index) in headerMot" v-bind:key="index">        
            <p id="relationHeaderMot" v-if="value"><b-badge variant="info" >{{name}}:</b-badge>  {{value}} </p>   
          </span>
         </div> 
        </div> 
    </b-card>
    <b-card no-body id="top">
      <div class="showSmall">
        <b-form-select id="selectRel" v-model="selected" :options="RelOptions" @change="changeSelected"></b-form-select>
          <b-card class="cardsSmall" id="DéfinitionsCard" title="Définitions" v-if="def != undefined">
          <b-card-text id='defCardText'> 
              <p v-for="(item, index) in def" v-bind:key="index"> {{index + 1}}. <span v-html="item">
              </span></p>
          </b-card-text>
          </b-card>
          <b-card class="cardsSmall" :id="name + 'Card'" v-for="(value, name, index) in relationsTriees" v-bind:key="index" header-tag="header">
              <template #header>
                <span style="float: left;" class="centerheader font-weight-bold">{{name}}</span>
                <b-button v-bind:id="'popoverSmall' + index" style="float: left; margin-left:0.5em;" size="sm" class="mb-0" >
                  <b-popover v-bind:target="'popoverSmall' + index" triggers="focus">
                    <template #title>Informations sur la relation {{name}}</template>
                    {{getrelationInfo(name)}}
                  </b-popover>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-question" viewBox="0 0 16 16">
                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>
                </b-button> 
                <b-form-select v-model="selectedTri" :options="TriOptions" @change="changeSelectedTri(value)"></b-form-select>
                <!-- <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(name, value, 'alpha-down')">
                    <b-icon icon="sort-alpha-down" aria-hidden="true"></b-icon> 
                  </b-button> 
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(name, value, 'alpha-up')">
                    <b-icon icon="sort-alpha-down-alt" aria-hidden="true"></b-icon> 
                  </b-button>
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(name, value, 'numeric-up')">
                    <b-icon icon="sort-numeric-down-alt" aria-hidden="true"></b-icon> 
                  </b-button>     
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(name, value, 'numeric-down')">
                    <b-icon icon="sort-numeric-down" aria-hidden="true"></b-icon> 
                  </b-button>  -->
                  <br>
              </template>
                <b-card-text>
                <span class="mouseHighlight" v-bind:title="'Poids: ' + obj[1]" v-for="(obj, index) in value" v-bind:key="index" v-bind:class="getClassPoids(obj)" v-on:click="prepareRequest(obj[0])">{{ obj[0] }}<span v-if="index < value.length - 1"> • </span></span>
                <div>
                  <b-button variant="primary" v-on:click="loadmore(name, value.length)" v-if="value.length >= 500 && relationsSizes[name] != value.length"> Load more </b-button>
                </div>         
              </b-card-text>
            </b-card>
      </div>
      <b-tabs class="showWide" pills card vertical>
        <b-tab title="Définition" v-if="def != undefined">
          <b-card-text id='defCardText'> 
              <p v-for="(item, index) in def" v-bind:key="index"> {{index + 1}}. <span v-html="item">
              </span></p>
          </b-card-text>

          <template v-slot:title>
              Définition
            </template>
        </b-tab>

        <div v-for="(value, name, index) in relationsTriees" v-bind:key="index">
          <b-tab no-body>
            <b-card header-tag="header">
              <template #header>
                <span style="float: left;" class="centerheader font-weight-bold">{{name}}</span>
                <b-button v-bind:id="'popover' + index" style="float: left; margin-left:0.5em;" size="sm" class="mb-0" >
                  <b-popover v-bind:target="'popover' + index" triggers="focus">
                    <template #title>Informations sur la relation {{name}}</template>
                    {{getrelationInfo(name)}}
                  </b-popover>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-question" viewBox="0 0 16 16">
                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>
                </b-button> 
                <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(value, 'alpha-down')">
                    <b-icon icon="sort-alpha-down" aria-hidden="true"></b-icon> 
                  </b-button> 
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(value, 'alpha-up')">
                    <b-icon icon="sort-alpha-down-alt" aria-hidden="true"></b-icon> 
                  </b-button>
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(value, 'numeric-up')">
                    <b-icon icon="sort-numeric-down-alt" aria-hidden="true"></b-icon> 
                  </b-button>     
                  <b-button id="sortbutton" size="sm" class="mb-0" @click="sortRel(value, 'numeric-down')">
                    <b-icon icon="sort-numeric-down" aria-hidden="true"></b-icon> 
                  </b-button> 
                  <span class="centerheader" style="float: right;"> Trier les termes: </span>
              </template>
                <b-card-text>
                <span class="mouseHighlight" v-bind:title="'Poids: ' + obj[1]" v-for="(obj, index) in value" v-bind:key="index" v-bind:class="getClassPoids(obj)" v-on:click="prepareRequest(obj[0])">{{ obj[0] }}<span v-if="index < value.length - 1"> • </span></span>
                <div>
                  <b-button variant="primary" v-on:click="loadmore(name, value.length)" v-if="value.length >= 500 && relationsSizes[name] != value.length"> Load more </b-button>
                </div>         
              </b-card-text>
            </b-card>


            <template v-slot:title>
              <div v-on:click="scrollToTop()">{{name}}<b-badge style="float:right;" v-if="value.length >= 500 && relationsSizes[name] != value.length" variant="primary">{{value.length}}+</b-badge><b-badge v-else variant="primary" style="float:right;">{{value.length}}</b-badge></div>
            </template>

            <b-overlay :show.sync="show" no-wrap></b-overlay>
          </b-tab>
        </div>
      </b-tabs>
    </b-card>
    <div id="errorText"><p>Il y a une erreur sur la requête</p><b-button v-on:click="prepareRequest()">Recharger la page</b-button></div>
  </div>
</template>
<script>
export default {
  name: "DisplayerV2",

  data() {
    return{
      selected: null,
      RelOptions: [],
      selectedTri: null,
      TriOptions: [{value:"Poids décroissant", text:"Poids décroissant"}, {value:"Poids croissant", text:"Poids croissant"}, {value:"Alphanumérique", text:"Alphanumérique"}, {value:"Alphanumérique inverse", text:"Alphanumérique inverse"}]
    }
  },

  props: {
    show: Boolean,
    def: Array,
    relationsTriees: Object,
    mot: String,
    headerMot: Object,
    jsonPoids: Array,
    relationsTypes: Array,
    relationsSizes: Object
  },

  mounted(){
      if(this.def != undefined){
        this.RelOptions.push({value: "Définitions", text: "Définitions"})
      }
      for(let key in this.relationsTriees){
        this.RelOptions.push({value: key, text: key})     
      }
      if(this.RelOptions.length > 0){
        this.selected = this.RelOptions[0].value
        let visible = document.getElementById(this.selected + 'Card')
        visible.style.display = 'inline'
        this.selectedTri = this.TriOptions[0].value
      }else{
        this.showError()
        if(this.mot != null){
          this.$emit("reset-mot", this.mot) 
        }   
      }
  },

  methods: {

    changeSelected: function(){
      let hidden = document.getElementsByClassName('cardsSmall')
      for(let el of hidden){
        el.style.display = 'none'
      }
      let visible = document.getElementById(this.selected + 'Card')
      visible.style.display = 'inline'
    },

    changeSelectedTri: function(value){
      if(this.selectedTri == "Poids décroissant"){
        this.sortRel(value, "numeric-up")
      }else if(this.selectedTri == "Poids croissant"){
        this.sortRel(value, "numeric-down")
      }else if(this.selectedTri == "Alphanumérique"){
        this.sortRel(value, "alpha-down")
      }else if(this.selectedTri == "Alphanumérique inverse"){
        this.sortRel(value, "alpha-up")
      }
    },

    popover: function(poids){
      return "Poids: " + poids
    },
    getClassPoids: function(r){
      let poids = parseInt(r[1])
      if(poids < 10){
        return "t1"
      }else if(poids < 25){
        return "t2"
      }else if(poids < 45){
        return "t3"
      }
      return "t4"
    },
    scrollToTop: function() {
      var bodyRect = document.body.getBoundingClientRect()
      var element = document.getElementById("top")
      var elemRect = element.getBoundingClientRect()
      var offset   = elemRect.top - bodyRect.top;
      if(window.scrollY > offset){
        window.scrollTo(0,offset);
      }       
    },
    showError: function(){
      let h1 = document.getElementsByClassName('showSmall')
      for(let el of h1){
        el.style.display = 'none'
      }
      let h2 = document.getElementsByClassName('showWide')
      for(let el of h2){
        el.style.display = 'none'
      }
      let show = document.getElementById('errorText')
      show.style.display = 'inline'
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
    sortRel: function(value, type){
      if(type == "alpha-up"){
        value.sort((a, b) => b[0].localeCompare(a[0]))
      }else if(type == "alpha-down"){
        value.sort((a, b) => a[0].localeCompare(b[0]))
      }else if(type == "numeric-up"){
        value.sort((a, b) => b[1] - a[1])
      }else if(type == "numeric-down"){
        value.sort((a, b) => a[1] - b[1])
      }
      
    },
    loadmore: function(relName, index) {
      this.$emit("load-more", relName, index)
    },

    getrelationInfo: function(name) {
      for(let relIndex in this.relationsTypes){
        if(this.relationsTypes[relIndex][3] === name){
          return this.relationsTypes[relIndex][4]
        }
      }
      return "Pas d'informations sur la relation"
    }
  },
};
</script>

<style scoped>
#whitespace {
    margin-right: 0.5em;
}
#relationHeaderMot{
  text-align: left;
  margin-bottom: 0;
}
.mouseHighlight:hover{
cursor:pointer;
text-shadow: 2px 2px 8px #000000;
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
#sortbutton{
  vertical-align: top;
  float: right;
  margin-left: 0.5em;
}
.centerheader{
  margin-top: 0.3em;
  }

.cardsSmall{
  display: none;
}

#top{
  margin-top:0.5em;
}

#selectRel{
  display: none;
}

#errorText{
  display: none;
}

@media (max-width: 800px){
  .showSmall{
    display:inline
  }
  .showWide{
  display: none;
  } 
  #selectRel{
  display: inline;
} 
}

@media (min-width: 800px){
  .showSmall{
    display:none
  }
    #selectRel{
    display: none;
  }
  .cardsSmall{
  display: none;
}
}
</style>