<script>
  import Images from "./Images.svelte";
  import Modal from "./Modal.svelte";
</script>

<style>

</style>

<div class="svelte-images-container">
  <Modal>
    <Images {...$$props} />
  </Modal>
</div>
