<script>
  import Images from "./Images/index.svelte";
  const images = [...Array(6).keys()].map(i => ({
    src: `/images/${i + 1}.jpg`
  }));
</script>

<style>
  main {
    height: 75vh;
  }
</style>

<main>
  <Images {images} gutter={5} numCols={3} />
</main>
