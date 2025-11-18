<template>
  <div v-if="isOpen" class="popover-overlay" @click="$emit('close')">
    <div class="popover" @click.stop>
      <h4>Set fallback for {{ tagName }}</h4>
      <input
        type="text"
        class="popover-input"
        placeholder="Enter fallback value"
        :value="fallbackValue"
        @input="$emit('fallback-change', tagValue, $event.target.value)"
        ref="input"
      />
      <button class="btn" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Popover',
  props: {
    isOpen: Boolean,
    tagValue: String,
    tagName: String,
    fallbackValue: String
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.input?.focus();
        });
      }
    }
  }
}
</script>
