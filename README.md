# svelte-images
A Svelte component for displaying images


## Installation

1. Install svelte-images
   `yarn add svelte-images`
2. Use the Images component in your svelte application

## Example

```html
<script>
  import Images from "./Images/index.svelte";
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

  
## Contributing

Found a bug or have suggestions for improvement? We would love to hear from you!

Please open an issue to submit feedback or problems you come across.