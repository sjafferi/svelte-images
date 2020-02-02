<script>
  import Images from "./Images/index.svelte";
  const images = [
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    }
  ];
</script>

<style>
  main {
    height: 75vh;
  }
</style>

<main>
  <Images {images} gutter={5} numCols={3} />
</main>
