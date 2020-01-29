<script>
  import { fade } from "svelte/transition";
  export let images;
  export let curr_idx = 0;

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
    height: 100%;
    width: auto;
    margin: auto;
    user-select: none;
  }
  .carousel .img-container {
    width: 100vw;
    display: flex;
    justify-content: center;
  }
  .nav button {
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none !important;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    color: white;
    margin: 0 20px;
  }
  .nav svg {
    display: inline-block;
    fill: currentcolor;
    height: 48px;
    stroke: currentcolor;
    stroke-width: 0;
    width: 48px;
  }
  .empty {
    width: 100px;
  }
</style>

<div class="carousel" style={`transform: translate3d(${translateX}px, 0, 0);`}>
  {#each images as image, i}
    <div class="img-container">
      <div class="nav">
        {#if blink && curr_idx > 0}
          <button on:click={left} in:fade out:fade>
            <svg role="presentation" viewBox="0 0 24 24" class="css-8wgz7g">
              <path
                d="M15.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.406-4.594 4.594z" />
            </svg>
          </button>
        {:else}
          <div class="empty" />
        {/if}
        {#if blink && curr_idx < images.length - 1}
          <button on:click={right} in:fade out:fade>
            <svg role="presentation" viewBox="0 0 24 24" class="css-8wgz7g">
              <path d="M9.984 6l6 6-6 6-1.406-1.406 4.594-4.594-4.594-4.594z" />
            </svg>
          </button>
        {:else}
          <div class="empty" />
        {/if}
      </div>
      <img {...image} alt={image.alt || ''} />
    </div>
  {/each}
</div>
