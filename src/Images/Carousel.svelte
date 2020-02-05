<script>
  import { fade } from "svelte/transition";
  import ClickOutside from "./ClickOutside.svelte";
  export let images;
  export let close;
  export let curr_idx = 0;
  const left_nav_buttons = new Array(images.length);
  const right_nav_buttons = new Array(images.length);
  let translateX = -curr_idx * window.innerWidth;

  function increment(num) {
    return num >= images.length - 1 ? num : num + 1;
  }

  function decrement(num) {
    return num == 0 ? 0 : num - 1;
  }

  const blinkDelay = 50;
  let blink = true;

  function doBlink() {
    blink = false;
    setTimeout(() => (blink = true), blinkDelay);
  }

  function right() {
    doBlink();
    curr_idx = increment(curr_idx);
    translateX -= window.innerWidth;
  }

  function left() {
    doBlink();
    curr_idx = decrement(curr_idx);
    translateX += window.innerWidth;
  }

  function handleResize() {
    translateX = -curr_idx * window.innerWidth;
  }
</script>

<style>
  .carousel {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    transition: transform 500ms cubic-bezier(0.23, 1, 0.32, 1) 0s,
      opacity 500ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  }
  .nav {
    display: flex;
    box-sizing: border-box;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    position: absolute;
    width: 100vw;
    height: 100%;
  }
  .carousel img {
    height: auto;
    max-width: 80vw;
    max-height: 85vh;
    margin: auto;
    user-select: none;
  }
  :global(.carousel .click-outside-wrapper) {
    width: 100vw;
  }
  .img-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .nav button {
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none !important;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 5em;
    height: 5em;
    display: flex;
    color: white;
    margin: 0 17px;
  }
  .nav button:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .nav svg {
    display: inline-block;
    fill: currentcolor;
    height: 5em;
    width: 5em;
    stroke: currentcolor;
    stroke-width: 0;
  }
  .empty {
    width: 100px;
  }
  @media (max-width: 800px) {
    .carousel img {
      max-width: 75vw;
    }
    .nav button {
      margin: 0 12px;
      width: 4em;
      height: 4em;
    }
    .nav svg {
      width: 4em;
      height: 4em;
    }
  }
  @media (max-width: 550px) {
    .carousel img {
      max-width: 60vw;
    }
    .nav button {
      margin: 0 10px;
      width: 3em;
      height: 3em;
    }
    .nav svg {
      width: 3em;
      height: 3em;
    }
  }
</style>

<svelte:window on:resize={handleResize} />

<div class="carousel" style={`transform: translate3d(${translateX}px, 0, 0);`}>
  {#each images as image, i}
    <ClickOutside
      className="click-outside-wrapper"
      on:clickoutside={close}
      exclude={[...left_nav_buttons, ...right_nav_buttons]}>
      <div class="img-container">
        <div class="nav">
          {#if blink && curr_idx > 0}
            <button
              on:click={left}
              in:fade
              out:fade
              bind:this={left_nav_buttons[i]}>
              <svg role="presentation" viewBox="0 0 24 24">
                <path
                  d="M15.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.406-4.594
                  4.594z" />
              </svg>
            </button>
          {:else}
            <div class="empty" />
          {/if}
          {#if blink && curr_idx < images.length - 1}
            <button
              on:click={right}
              in:fade
              out:fade
              bind:this={right_nav_buttons[i]}>
              <svg role="presentation" viewBox="0 0 24 24">
                <path
                  d="M9.984 6l6 6-6 6-1.406-1.406 4.594-4.594-4.594-4.594z" />
              </svg>
            </button>
          {:else}
            <div class="empty" />
          {/if}
        </div>
        <img {...image} alt={image.alt || ''} />
      </div>
    </ClickOutside>
  {/each}
</div>
