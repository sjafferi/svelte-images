# svelte-images
A Svelte component for displaying images


## Installation

Install svelte-images
   `yarn add svelte-images`

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

### Properties

| Prop name | Format                                      | Default                                                       |
| --------- | ------------------------------------------- |
| images*   | { src: "...", alt: "..", title: "..", ... } | []                                                            |
| gutter    | number                                      | 3                                                             |
| numCols   | number                                      | automatically set depeneding on width of container if not set |
  
## Contributing

Found a bug or have suggestions for improvement? We would love to hear from you!

Please open an issue to submit feedback or problems you come across.