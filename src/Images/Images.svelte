<script>
  import { getContext } from "svelte";
  import Carousel from "./Carousel.svelte";

  export let images = [];
  export let gutter = 2;

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
    max-width: 200px;
    width: 100% !important;
    height: auto !important;
    cursor: pointer;
    margin: calc(var(--gutter) * 2px);
  }
  img:hover {
    opacity: 0.8;
  }
</style>

<div class="gallery" style="--gutter: {gutter};">
  {#each images as image, i}
    <img {...image} alt={image.alt || ''} on:click={() => popModal(i)} />
  {/each}
</div>
