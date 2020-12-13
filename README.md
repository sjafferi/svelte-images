# This is a fork of svelte-images
A Svelte component for displaying images

[Demo](https://sjafferi.github.io/svelte-images/)


Fixed few bugs [PR#4](https://github.com/sjafferi/svelte-images/pull/4)
## Installation

Install svelte-images
   `yarn add svelte-images`

## Examples

### Gallery + Carousel

```html
<script>
  import { Images } from "svelte-images";
  const images = [
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    },
    {
      src: "/borat.png"
    }
  ];
</script>

<style>
  main {
    height: 75vh;
  }
</style>

<main>
  <Images {images} gutter={5} />
</main>
```

### Carousel only

```html
<script>
  import { Carousel } from "svelte-images";
  const { Modal, open, close } = Carousel;

  export let images = [];

  const popModal = idx =>
    setTimeout(() => {
      open(images, idx);
    }, 0);
</script>

<style>
  .gallery {
    display: flex;
    flex-flow: row wrap;
  }

  img {
    width: 100%;
    height: auto !important;
    cursor: pointer;
  }
  img:hover {
    opacity: 0.5;
    filter: grayscale(0.5) blur(1px);
  }
</style>

<Modal />

<div class="gallery">
  {#each images as image, i}
    <img
      {...image}
      src={image.thumbnail || image.src}
      alt={image.alt || ''}
      on:click={() => popModal(i)} />
  {/each}
</div>

```

### Images component properties

| Property | Format                                                    | Default                                           |
| -------- | --------------------------------------------------------- | ------------------------------------------------- |
| images*  | `[{ src: "...", thumbnail: "...", ...<img> attributes }]` | []                                                |  |
| gutter   | number                                                    | 3                                                 |  |
| numCols  | number                                                    | automatically set depending on width of container |
  
## Contributing

Found a bug or have suggestions for improvement? We would love to hear from you!

Please open an issue to submit feedback or problems you come across.