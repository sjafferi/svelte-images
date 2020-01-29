<script>
  import Images from "./Images.svelte";
  import Modal from "./Modal.svelte";
</script>

<style>
  .svelte-images-container {
    width: 100%;
    height: 100%;
    display: flex;
  }
  :global(.svelte-images-container > div) {
    display: flex;
    flex: 1 1;
  }
</style>

<div class="svelte-images-container">
  <Modal>
    <Images {...$$props} />
  </Modal>
</div>
