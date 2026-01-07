<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let text: string = '';
  export let href: string = '';
  export let btnType: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark' = 'por-btn-primary';
  export let target: '_blank' | '_self' = '_blank';
  export let customClass: string = '';

  const dispatch = createEventDispatcher();

  function handleClick(event: MouseEvent) {
    if (href) {
      window.open(href, target);
    }
    dispatch('click', event);
  }
</script>

<button 
  class="pep-button {btnType} {customClass}"
  on:click|stopPropagation={handleClick}
>
  {text}
</button>

<style>
  .pep-button {
    flex: 1;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    max-width: 120px;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  /* 基础按钮类型 */
  .por-btn-primary { 
    background-color: #111; 
    color: #fff; 
  }
  .por-btn-primary:hover {
    background-color: #333;
  }

  .por-btn-secondary { 
    background-color: #fff; 
    border-color: #111; 
    color: #111; 
  }
  .por-btn-secondary:hover {
    background-color: #f5f5f5;
  }

  .por-btn-dark { 
    background-color: transparent; 
    color: #111; 
  }
  .por-btn-dark:hover {
    text-decoration: underline;
  }

  @media (max-width: 767px) {
    .pep-button {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
</style>
