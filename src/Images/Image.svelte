<script>
  export let lazy = true;
  export let imageProps = {};

  export let onClick = () => {};
  let className = "";
  let loaded = !lazy;
  let afterLoad = false;
  function load(img) {
    img.onload = () => {
      loaded = true;
      setTimeout(() => (afterLoad = true), 1500);
    };
  }
</script>

<style>
  img {
    opacity: 0;
    transition: all 1s ease;
  }
  .after-load {
    transition: none;
  }
  .loaded {
    opacity: 1;
  }
</style>

<img
  on:click={onClick}
  use:load
  class:blur={!loaded}
  class:after-load={afterLoad}
  class:loaded
  {...imageProps}
  alt={imageProps.alt || ''} />
