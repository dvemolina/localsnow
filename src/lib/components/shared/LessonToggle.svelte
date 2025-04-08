<script lang="ts">
    let showSki = $state(true)
</script>

<section class="lesson-toggle">
    <button class:active={showSki} onclick={() => showSki = true}>
      ⛷ Ski Lessons
    </button>
    <button class:active={!showSki} onclick={() => showSki = false}>
      🏂 Snowboard Lessons
    </button>
  
    {#if showSki}
      <div class="ski-content">
        <h2>Find Certified Ski Instructors</h2>
        <!-- Ski-specific content -->
    {:else if !showSki}
      <div class="snowboard-content">
        <h2>Professional Snowboard Coaching</h2>
        <!-- Snowboard content -->
    {/if}
  </section>
  
  <style>
    .lesson-toggle button.active {
      border-bottom: 3px solid #2563eb; /* Primary brand color */
      font-weight: 600;
    }
  </style>