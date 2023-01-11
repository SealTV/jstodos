<template>
  <div>
    <h1>Happy counting!</h1>
    <p style="font-size:40px">{{ count }} </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data: () => {
    return {
      count: 0
    }
  },
  mounted: async function () {
    await this.loadCount();
  },
  methods: {
    loadCount: async function () {
      console.log(`try to load count from ${process.env.VUE_APP_APIURL}`);
      try {
        const response = await axios.get(`${process.env.VUE_APP_APIURL}/`);
        this.count = response.data.changed;
        setTimeout(this.loadCount, 3000);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
