<template>
  <span
    class="tag tag-blue"
    @click="handleClick"
    :style="{ cursor: 'pointer' }"
    :contenteditable="false"
  >
    {{ displayValue }}
    <button
      v-if="isClosable"
      class="tag-close"
      @click="handleClose"
      :contenteditable="false"
    >
      ×
    </button>
  </span>
</template>

<script>
const TAG_NAMES = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address'
};

export default {
  name: 'Tag',
  props: {
    value: String,
    fallback: String,
    isClosable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayValue() {
      const tagName = TAG_NAMES[this.value] || this.value;
      return this.fallback ? `${tagName} | ${this.fallback}` : tagName;
    }
  },
  methods: {
    handleClick(e) {
      e.stopPropagation();
      this.$emit('click');
    },
    handleClose(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit('close');
    }
  }
}
</script>
