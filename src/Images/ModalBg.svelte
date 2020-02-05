<script>
  import { fade } from "svelte/transition";
  export let transitionBg = fade;
  export let transitionBgProps = { duration: 250 };
  export let transitionWindow = transitionBg;
  export let transitionWindowProps = transitionBgProps;
  export let handleOuterClick;
  export let background;
  export let wrap;
  export let Component;
</script>

<style>
  .bg {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.66);
    transition: opacity 200ms ease 0s;
  }
  .window-wrap {
    position: relative;
  }
  .window {
    position: relative;
  }
  .content {
    position: relative;
  }
</style>

<div
  class="bg"
  on:click={handleOuterClick}
  bind:this={background}
  transition:transitionBg={transitionBgProps}>
  <div class="window-wrap" bind:this={wrap}>
    <div class="window" transition:transitionWindow={transitionWindowProps}>
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</div>
