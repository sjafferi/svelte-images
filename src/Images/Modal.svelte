<script>
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { modalStore, open, close } from "./modalStore.js";

  let state = {};
  let isOpen = false;
  let props = null;
  let Component = null;
  let background;
  let wrap;

  const handleKeyup = ({ key }) => {
    if (Component && key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const handleOuterClick = event => {
    if (event.target === background || event.target === wrap) {
      event.preventDefault();
      close();
    }
  };

  const unsubscribe = modalStore.subscribe(value => {
    Component = value.Component;
    props = value.props;
    isOpen = value.isOpen;
  });

  onDestroy(unsubscribe);
</script>

<style>
  * {
    box-sizing: border-box;
  }
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
    top: 0;
    left: 0;
  }
  .window-wrap {
    position: relative;
  }
  .content {
    position: relative;
  }
</style>

<svelte:window on:keyup={handleKeyup} />

<div>
  {#if isOpen}
    <div
      class="bg"
      on:click={handleOuterClick}
      bind:this={background}
      transition:fade={{ duration: 300 }}>
      <div
        class="window-wrap"
        bind:this={wrap}
        transition:fade={{ duration: 300 }}>
        <div class="content">
          <svelte:component this={Component} {...props} />
        </div>
      </div>
    </div>
  {/if}
  <slot />
</div>
