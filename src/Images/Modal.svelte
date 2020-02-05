<script>
  // from https://github.com/flekschas/svelte-simple-modal
  import ModalBg from "./ModalBg.svelte";
  import { setContext as baseSetContext } from "svelte";
  export let key = "simple-modal";
  export let closeOnEsc = true;
  export let closeOnOuterClick = true;
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
</style>

<svelte:window on:keyup={handleKeyup} />

<div>
  <svelte:component
    this={isOpen ? ModalBg : null}
    {handleOuterClick}
    {background}
    {wrap}
    {Component}>
    <svelte:component this={Component} {...props} />
  </svelte:component>
  <slot />
</div>
