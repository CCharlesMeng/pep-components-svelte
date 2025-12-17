<script lang="ts">
  import type { CardData } from "./types";

  export let cardData: CardData = {};
  export let cardBackgroundColor: string = "#ffffff";
</script>

<div class="card" style="background-color: {cardBackgroundColor};">
  {#if cardData.showImage && cardData.imageUrl}
    <div class="image-container">
      <img src={cardData.imageUrl} alt={cardData.title} />
    </div>
  {/if}

  <div class="card-body">
    {#if cardData.showTitle && cardData.title}
      <h3 class="card-title">{cardData.title}</h3>
    {/if}

    {#if cardData.showDescription && cardData.description}
      <p class="card-description">{cardData.description}</p>
    {/if}

    {#if cardData.tags && cardData.tags.length > 0}
      <div class="tags">
        {#each cardData.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}

    <div class="card-footer">
      <div class="price-info">
        {#if cardData.priceSymbol}
          <span class="currency">{cardData.priceSymbol}</span>
        {/if}
        {#if cardData.price !== undefined}
          <span class="price">{cardData.price}</span>
        {/if}
        {#if cardData.unit}
          <span class="unit">/{cardData.unit}</span>
        {/if}
      </div>

      {#if cardData.showInquiry}
        <button class="inquiry-btn">Inquiry</button>
      {/if}
    </div>

    {#if cardData.linkUrl}
      <a href={cardData.linkUrl} class="card-link" aria-label="View product"
      ></a>
    {/if}
  </div>
</div>

<style>
  .card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .image-container {
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio */
    position: relative;
    background-color: #f9f9f9;
  }

  .image-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-body {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-description {
    font-size: 14px;
    color: #666;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .tag {
    background-color: #f0f0f0;
    color: #666;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .card-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price-info {
    display: flex;
    align-items: baseline;
    color: #e53935;
  }

  .currency {
    font-size: 14px;
    font-weight: 500;
  }

  .price {
    font-size: 18px;
    font-weight: 700;
    margin: 0 2px;
  }

  .unit {
    font-size: 12px;
    color: #999;
  }

  .inquiry-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    z-index: 2; /* Ensure button is clickable above the link overlay */
    position: relative;
  }

  .inquiry-btn:hover {
    background-color: #0056b3;
  }

  .card-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
</style>
