<template>
  <div>
    <form action="" class="search-bar" >
      <input type="search" name="search" pattern=".*\S.*" required
        v-model="text"
        @keydown.enter = 'enter'
        @keydown.down = 'down'
        @keydown.up = 'up'
        @input = 'change'>
      <a class="search-btn" @click="prepareRequest">
        <span>Search</span>
      </a>
    </form>
    <b-list-group v-if="openSuggestion" class="dropdown-menu" style="position:relative; width:100%; padding: 0px; margin-bottom: 16px;">
          <b-list-group-item href="#" v-for="(suggestion, index) in matches"
            v-bind:key="index"
            v-bind:active="isActive(index)"
            @click="suggestionClick(index)"
          >
            {{ suggestion }}
          </b-list-group-item>
        </b-list-group>

    <div v-if="showListeMotsFromSearch">
        <DisplayerListeMots 
          :infoListeMotsFromSearch.sync="infoListeMotsFromSearch" 
          >        
        </DisplayerListeMots>
      </div>

    <div v-if="showCardFromSearch">
        <Displayer 
          :def.sync="infoData[0]" 
          :relationsTriees.sync="infoData[1]" 
          :show.sync="show" 
          :headerMot.sync="infoData[2]"
          v-on:update-mot="updateMot"
          >        
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
import DisplayerListeMots from "./DisplayerListeMots.vue";

export default {
  name: "Search",

  components: {
    Displayer,
    Interface,
    DisplayerListeMots,
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
    requestAnswer: String,
    infoData: Array,
    showCardFromSearch: Boolean,
    infoListeMotsFromSearch: Object,
    showListeMotsFromSearch: Boolean,
    displayLoader: Boolean,
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
      this.open = false;
      this.$emit("resetAllVariable");
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

<style scoped>
  * {
	border: 0;
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}
:root {
	font-size: calc(16px + (24 - 16)*(100vw - 320px)/(1920 - 320));
}
body, button, input {
	font: 1em Hind, sans-serif;
	line-height: 1.5em;
}
body, input {
	color: #171717;
}
body, .search-bar {
	display: flex;
}
body {
	background: #f1f1f1;
	height: 100vh;
}
.search-bar input,
.search-btn, 
.search-btn:before, 
.search-btn:after {
	transition: all 0.25s ease-out;
}
.search-bar input,
.search-btn {
	width: 3em;
	height: 3em;
}
.search-bar input:invalid:not(:focus),
.search-btn {
	cursor: pointer;
}
.search-bar,
.search-bar input:focus,
.search-bar input:valid  {
	width: 100%;
}
.search-bar input:focus,
.search-bar input:not(:focus) + .search-btn:focus {
	outline: transparent;
}
.search-bar {
	margin: auto;
	padding: 1.5em;
	justify-content: center;
	max-width: 30em;
}
.search-bar input {
	background: transparent;
	border-radius: 1.5em;
	box-shadow: 0 0 0 0.4em #171717 inset;
	padding: 0.75em;
	transform: translate(0.5em,0.5em) scale(0.5);
	transform-origin: 100% 0;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
}
.search-bar input::-webkit-search-decoration {
	-webkit-appearance: none;
}
.search-bar input:focus,
.search-bar input:valid {
	background: #fff;
	border-radius: 0.375em 0 0 0.375em;
	box-shadow: 0 0 0 0.1em #d9d9d9 inset;
	transform: scale(1);
}
.search-btn {
	background: #171717;
	border-radius: 0 0.75em 0.75em 0 / 0 1.5em 1.5em 0;
	padding: 0.75em;
	position: relative;
	transform: translate(0.25em,0.25em) rotate(45deg) scale(0.25,0.125);
	transform-origin: 0 50%;
}
.search-btn:before, 
.search-btn:after {
	content: "";
	display: block;
	opacity: 0;
	position: absolute;
}
.search-btn:before {
	border-radius: 50%;
	box-shadow: 0 0 0 0.2em #f1f1f1 inset;
	top: 0.75em;
	left: 0.75em;
	width: 1.2em;
	height: 1.2em;
}
.search-btn:after {
	background: #f1f1f1;
	border-radius: 0 0.25em 0.25em 0;
	top: 51%;
	left: 51%;
	width: 0.75em;
	height: 0.25em;
	transform: translate(0.2em,0) rotate(45deg);
	transform-origin: 0 50%;
}
.search-btn span {
	display: inline-block;
	overflow: hidden;
	width: 1px;
	height: 1px;
}

/* Active state */
.search-bar input:focus + .search-btn,
.search-bar input:valid + .search-btn {
	background: #2762f3;
	border-radius: 0 0.375em 0.375em 0;
	transform: scale(1);
}
.search-bar input:focus + .search-btn:before, 
.search-bar input:focus + .search-btn:after,
.search-bar input:valid + .search-btn:before, 
.search-bar input:valid + .search-btn:after {
	opacity: 1;
}
.search-bar input:focus + .search-btn:hover,
.search-bar input:valid + .search-btn:hover,
.search-bar input:valid:not(:focus) + .search-btn:focus {
	background: #0c48db;
}
.search-bar input:focus + .search-btn:active,
.search-bar input:valid + .search-btn:active {
	transform: translateY(1px);
}

@media screen and (prefers-color-scheme: dark) {
	body, input {
		color: #000000;
	}
	body {
		background: #171717;
	}
	.search-bar input {
		box-shadow: 0 0 0 0.4em #000000 inset;
	}
	.search-bar input:focus,
	.search-bar input:valid {
		background: #ffffff;
		box-shadow: 0 0 0 0.1em #000000 inset;
	}
	.search-btn {
		background: #000000;
	}
}
</style>