<script>
  export let lazy = true;
  export let imageProps = {};

  export let onClick = () => {};
  let className = "";
  let loaded = !lazy;
  function load(img) {
    img.onload = () => (loaded = true);
  }
</script>

<style>
  img {
    opacity: 0;
    transition: opacity 0.4s ease, filter 0.5s ease;
    transition-delay: 0.7s;
  }
  .blur {
    opacity: 0.75;
    filter: blur(5px);
    background: grey;
  }
  .loaded {
    opacity: 1;
  }
</style>

<img
  on:click={onClick}
  use:load
  class:blur={!loaded}
  class:loaded
  {...imageProps}
  alt={imageProps.alt || ''} />
