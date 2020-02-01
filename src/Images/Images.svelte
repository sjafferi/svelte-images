<script>
  import { getContext } from "svelte";
  import Carousel from "./Carousel.svelte";

  export let images = [];
  export let gutter = 2;
  export let numCols = 2;

  const { open, close } = getContext("simple-modal");

  const popModal = idx =>
    setTimeout(() => {
      open(Carousel, { images, curr_idx: idx, close });
    }, 0);
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
      style={numCols != undefined ? `width: ${100 / numCols - 6}%;` : 'max-width: 200px;'}
      {...image}
      src={image.thumbnail || image.src}
      alt={image.alt || ''}
      on:click={() => popModal(i)} />
  {/each}
</div>
