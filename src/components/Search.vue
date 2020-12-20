<template>
  <div>
    <b-input-group
      v-for="size in ['lg']"
      :key="size"
      :size="size"
      class="mb-3 pt-3"
      prepend="Mot"
    >
      <b-form-input v-model="text"
        @keydown.enter = 'enter'
        @keydown.down = 'down'
        @keydown.up = 'up'
        @input = 'change'
      />
      <b-input-group-append>
         <b-button variant="primary" @click="prepareRequest">Rechercher</b-button>
      </b-input-group-append>
      </b-input-group>
        <b-list-group v-if="openSuggestion" class="dropdown-menu" style="position:relative; width:100%; padding: 0px; margin-bottom: 16px;">
          <b-list-group-item href="#" v-for="(suggestion, index) in matches"
            v-bind:key="index"
            v-bind:active="isActive(index)"
            @click="suggestionClick(index)"
          >
            {{ suggestion }}
          </b-list-group-item>
        </b-list-group>
    <div v-if="showCardFromSearch">
      <!-- <div v-for="(value, name, index) in elements" v-bind:key="index">
          <Displayer :text="infoData[name]" :show.sync="show" :elements="value"></Displayer>
        </div> -->
        <Displayer 
          :def.sync="infoData[0]" 
          :relationsTriees.sync="infoData[1]" 
          :show.sync="show" 
          :headerMot.sync="infoData[2]"
          v-on:update-mot="updateMot">
        </Displayer>
      </div>
      <div v-if="!showCardFromSearch">
        <Interface
        :displayLoader.sync="displayLoader">
        </Interface>
      </div>
  </div>
</template>

<script>
// import Displayer from "./Displayer.vue";
import Displayer from "./DiplayerV2.vue";
import Interface from "./Interface.vue";

export default {
  name: "Search",

  components: {
    Displayer,
    Interface,
  },

  data() {
    return {
      open: false,
      current: 0,
      text: "",
      show: true,
      elements: [
        "Definition",
        "ideesAssociees",
        "NodesTypes",
        "Entries",
        "RelationsSortantes",
        "RelationsEntrantes",
        "RelationsTypes",
      ],
      def: Array,
      relationsTriees: Object,
      headerMot: Object,
      suggestions: [
        "Bangalore",
        "Chennai",
        "Cochin",
        "Delhi",
        "Kolkata",
        "Mumbai",
        "Coca",
        "Calopo",
        "CCCCCC",
      ],
      selection: "",
      matches: [],
    };
  },

  props: {
    mot: String,
    requestAnswer: String,
    infoData: Array,
    showCardFromSearch: Boolean,
    displayLoader: Boolean,
    starting: Boolean,
  },

  computed: {
    //The flag
    openSuggestion() {
      return (
        this.text !== "" && this.matches.length != 0 && this.open === true
      );
    },
  },

  methods: {
    autoComplete: function(){
      const url = encodeURI("http://localhost:3000/autocomplete-mot/?motField=" + this.text)
      this.axios
        .get(url)
        .then((response) => {
          this.matches = response.data
        }).catch((error) => console.log(error))
    },

    updateMot: function (text) {
      this.text = text;
      this.prepareRequest();
    },

    prepareRequest: function () {
      this.$emit("resetAllVariable");
      this.$emit("update:starting",true);
      //this.$emit("update:mot", this.text);
      const url = encodeURI(
        "http://localhost:3000/chercher-mot/?motField=" + this.text
      );
      this.try(url);
      this.show = true;
    },

    try: function (url) {
      this.axios
        .get(url)
        .then((response) =>
          this.$emit(
            "update:requestAnswer",
            JSON.stringify(response),
            (this.show = false),
            this.$emit("waitingRequestAnswer")
          )
        )
        .catch((error) => this.$emit("update:requestAnswer", error.toString()));
    },

    //When enter pressed on the input
    enter() {
      if(this.matches.length == 0){
        this.prepareRequest()
      }else{
        this.text = this.matches[this.current];
        this.open = false;
      }     
    },

    //When up pressed while suggestions are open
    up() {
      if (this.current > 0) this.current--;
    },

    //When up pressed while suggestions are open
    down() {
      if (this.current < this.suggestions.length - 1) this.current++;
    },

    //For highlighting element
    isActive(index) {
      return index === this.current;
    },

    //When the user changes input
    change() {
      if(this.text.length == 0){
        this.matches = []
      }else{
        this.autoComplete()
      }    
      if (this.open == false) {
        this.open = true;
        this.current = 0;
      }
    },

    //When one of the suggestion is clicked
    suggestionClick(index) {
      this.text = this.matches[index];
      this.open = false;
      this.prepareRequest()
    },
  },
};
</script>