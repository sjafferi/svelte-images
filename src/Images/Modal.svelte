<script>
  // from https://github.com/flekschas/svelte-simple-modal
  import { setContext as baseSetContext } from "svelte";
  import { fade } from "svelte/transition";
  export let key = "simple-modal";
  export let closeOnEsc = true;
  export let closeOnOuterClick = true;
  export let transitionBg = fade;
  export let transitionBgProps = { duration: 250 };
  export let transitionWindow = transitionBg;
  export let transitionWindowProps = transitionBgProps;
  export let styleBg = { top: 0, left: 0 };
  export let styleWindow = {};
  export let styleContent = {};
  export let setContext = baseSetContext;

  let Component = null;
  let props = null;
  let background;
  let wrap;
  let customStyleBg = {};
  let customStyleWindow = {};
  let customStyleContent = {};
  const camelCaseToDash = str =>
    str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
  const toCssString = props =>
    Object.keys(props).reduce(
      (str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`,
      ""
    );
  $: cssBg = toCssString(Object.assign({}, styleBg, customStyleBg));
  $: cssWindow = toCssString(Object.assign({}, styleWindow, customStyleWindow));
  $: cssContent = toCssString(
    Object.assign({}, styleContent, customStyleContent)
  );
  const open = (
    NewComponent,
    newProps = {},
    style = { bg: {}, window: {}, content: {} }
  ) => {
    Component = NewComponent;
    props = newProps;
    customStyleBg = style.bg || {};
    customStyleWindow = style.window || {};
    customStyleContent = style.content || {};
  };
  const close = () => {
    Component = null;
    props = null;
    customStyleBg = {};
    customStyleWindow = {};
    customStyleContent = {};
  };
  const handleKeyup = ({ key }) => {
    if (closeOnEsc && Component && key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  const handleOuterClick = event => {
    if (
      closeOnOuterClick &&
      (event.target === background || event.target === wrap)
    ) {
      event.preventDefault();
      close();
    }
  };
  setContext(key, { open, close });

  $: isOpen = !!Component;
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

<svelte:window on:keyup={handleKeyup} />

<div>
  {#if isOpen}
    <div
      class="bg"
      on:click={handleOuterClick}
      bind:this={background}
      transition:transitionBg={transitionBgProps}
      style={cssBg}>
      <div class="window-wrap" bind:this={wrap}>
        <div
          class="window"
          transition:transitionWindow={transitionWindowProps}
          style={cssWindow}>
          <div class="content" style={cssContent}>
            <svelte:component this={Component} {...props} />
          </div>
        </div>
      </div>
    </div>
  {/if}
  <slot />
</div>
