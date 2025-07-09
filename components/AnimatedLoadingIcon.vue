<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
    width="50"
    height="50"
    style="
      shape-rendering: auto;
      display: block;
      background: rgb(255, 255, 255);
    ">
    <g>
      <circle
        stroke-dasharray="164.93361431346415 56.97787143782138"
        r="35"
        stroke-width="10"
        stroke="#0079c1"
        fill="none"
        cy="50"
        cx="50">
        <animateTransform
          keyTimes="0;1"
          values="0 50 50;360 50 50"
          dur="1s"
          repeatCount="indefinite"
          type="rotate"
          attributeName="transform" />
      </circle>
    </g>
  </svg>
</template>

<script>
// @ts-check

  export default {
    name: 'AnimatedLoadingIcon',
  };
</script>
