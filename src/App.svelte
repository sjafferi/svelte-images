<script>
  import Images from "./Images/Images.svelte";
  const images = [...Array(6).keys()].map(i => ({
    src: `./images/${i + 1}.jpg`
  }));
</script>

<style>
  main {
    height: 75vh;
  }
</style>

<svelte:head>Svelte Images | Demo</svelte:head>

<main>
  <Images {images} gutter={5} numCols={3} />
</main>
