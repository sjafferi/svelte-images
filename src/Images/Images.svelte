<script>
  import { onMount } from "svelte";
  import Image from "./Image.svelte";
  import { Modal, open, close } from "./carousel.js";

  export let images = [];
  export let gutter = 2;
  export let numCols;
  const popModal = idx =>
    setTimeout(() => {
      open(images, idx);
    }, 0);

  let galleryElems;
  let galleryElem;
  let showModal;
  onMount(() => {
    galleryElems = document.getElementsByClassName("svelte-images-gallery");
    const index = Array.prototype.findIndex.call(
      galleryElems,
      elem => elem === galleryElem
    );
    showModal = index === 0;
  });
</script>

<style>
  .svelte-images-gallery {
    display: flex;
    flex-flow: row wrap;
    /* height: 100%; */
  }

  :global(.svelte-images-gallery img) {
    width: 100%;
    min-height: 50px;
    height: auto !important;
    cursor: pointer;
    margin: calc(var(--gutter) * 2px);
  }
  :global(.svelte-images-gallery img:hover) {
    opacity: 0.5;
    transition: none;
    filter: grayscale(0.5) blur(1px);
  }
</style>

<div
  class="svelte-images-gallery"
  style="--gutter: {gutter};"
  bind:this={galleryElem}>
  {#each images as image, i}
    <Image
      imageProps={{ ...image, src: image.thumbnail || image.src, alt: image.alt || '', style: numCols != undefined ? `width: ${100 / numCols - 6}%;` : 'max-width: 200px;' }}
      onClick={() => popModal(i)} />
  {/each}
</div>

{#if showModal}
  <Modal />
{/if}
