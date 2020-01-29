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
    flex-wrap: wrap;
    flex: 1 1;
  }

  .img-container {
    background-color: #eee;
    box-sizing: border-box;
    float: left;
    margin: calc(var(--gutter) * 1px);
    overflow: hidden;
    position: relative;
    width: calc(25% - var(--gutter) * 2px);
  }

  .img-container:hover {
    opacity: 0.9;
  }

  .img-container img {
    cursor: pointer;
    position: absolute;
    max-width: 100%;
  }
</style>

<div class="gallery" style="--gutter: {gutter};">
  {#each images as image, i}
    <div class="img-container">
      <img {...image} alt={image.alt || ''} on:click={() => popModal(i)} />
    </div>
  {/each}
</div>
