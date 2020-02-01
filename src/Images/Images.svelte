<script>
  import { getContext } from "svelte";
  import Carousel from "./Carousel.svelte";

  export let images = [];
  export let gutter = 2;
  export let numCols;

  const { open } = getContext("simple-modal");

  const popModal = idx => {
    open(Carousel, { images, curr_idx: idx });
  };
</script>

<style>
  .gallery {
    display: flex;
    flex-flow: row wrap;
  }

  img {
    width: 100%;
    height: auto !important;
    cursor: pointer;
    margin: calc(var(--gutter) * 2px);
  }
  img:hover {
    opacity: 0.5;
    filter: grayscale(0.5) blur(1px);
  }
</style>

<div class="gallery" style="--gutter: {gutter};">
  {#each images as image, i}
    <img
      style={numCols != undefined ? `width: ${100 / images.length - 2}%;` : 'max-width: 200px;'}
      {...image}
      alt={image.alt || ''}
      on:click={() => popModal(i)} />
  {/each}
</div>
