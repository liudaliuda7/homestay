<template>
  <div class="property-page">
    <PropertyDetail />
  </div>
</template>

<script>
import PropertyDetail from '../components/PropertyDetail.vue';

export default {
  name: 'PropertyPage',
  components: {
    PropertyDetail
  }
};
</script>

<style scoped>
.property-page {
  background-color: #f9f9f9;
  min-height: 100vh;
}
</style>
