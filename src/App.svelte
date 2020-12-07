<script>
  import Page from './components/Page.svelte';

  let open = true;
</script>

<!-- <button on:click={() => open=!open}>For Testing Memory Leaks</button> -->

{#if open}
  <Page /> 
{/if}

<style>
  :global(body){
    max-width: 55rem;
    margin: 0 auto;
  }

  :global(pre){
    max-width: 100%;
    overflow-x: scroll;
  }
</style>