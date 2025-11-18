<template>
  <div
    ref="div"
    class="input-like-div"
    contenteditable
    @input="handleInput"
    @keydown="handleKeyDown"
    :data-placeholder="!value || !value.trim() ? placeholder : ''"
  />
</template>

<script>
import Vue from 'vue'
import Tag from './Tag.vue'

export default {
  name: 'InputLikeDiv',
  props: {
    placeholder: String,
    value: {
      type: String,
      default: ''
    },
    fallbacks: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isUpdating: false,
      tagInstances: []
    };
  },
  mounted() {
    if (this.value && /\{\{\w+\}\}/.test(this.value)) {
      this.renderValue(this.value);
    }
  },
  watch: {
    value(newVal) {
      if (!this.isUpdating && this.$refs.div && /\{\{\w+\}\}/.test(newVal)) {
        this.isUpdating = true;
        this.renderValue(newVal);
        this.$nextTick(() => {
          this.isUpdating = false;
        });
      }
    }
  },
  beforeDestroy() {
    this.tagInstances.forEach(instance => {
      instance.$destroy();
    });
    this.tagInstances = [];
  },
  methods: {
    parseValue(val) {
      if (!val) return [];
      const parts = [];
      const regex = /\{\{(\w+)\}\}/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(val)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', content: val.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'variable', name: match[1] });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < val.length) {
        parts.push({ type: 'text', content: val.substring(lastIndex) });
      }

      return parts.length ? parts : [{ type: 'text', content: val }];
    },

    renderValue(val) {
      if (!this.$refs.div) return;

      this.tagInstances.forEach(instance => {
        instance.$destroy();
      });
      this.tagInstances = [];

      this.$refs.div.innerHTML = '';
      const parts = this.parseValue(val);

      const self = this;
      parts.forEach((part) => {
        if (part.type === 'variable') {
          const container = document.createElement('span');
          container.setAttribute('data-variable', part.name);
          container.contentEditable = false;
          this.$refs.div.appendChild(container);

          const TagComponent = Vue.extend({
            components: { Tag },
            template: `
              <Tag
                :value="tagValue"
                :fallback="fallbackValue"
                :isClosable="true"
                @close="handleClose"
                @click="handleClick"
              />
            `,
            data() {
              return {
                tagValue: part.name,
                fallbackValue: self.fallbacks[part.name] || ''
              };
            },
            methods: {
              handleClose() {
                self.handleRemovingDynamicVariable(part.name);
              },
              handleClick() {
                self.$emit('tag-click', part.name);
              }
            }
          });

          const instance = new TagComponent();
          instance.$mount(container);
          this.tagInstances.push(instance);
        } else {
          this.$refs.div.appendChild(document.createTextNode(part.content));
        }
      });
    },

    toTitleCase(str) {
      if (!str) return '';
      return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase())
        .trim();
    },

    handleRemovingDynamicVariable(variableName) {
      const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
      const newValue = this.value.replace(regex, '');
      this.$emit('input', newValue);
    },

    handleInput(e) {
      if (this.isUpdating) return;

      let newValue = '';
      const childNodes = Array.from(e.target.childNodes);
      const hasTags = childNodes.some(node =>
        node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-variable')
      );

      if (hasTags) {
        childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            newValue += node.textContent;
          } else if (node.hasAttribute('data-variable')) {
            newValue += `{{${node.getAttribute('data-variable')}}}`;
          }
        });
      } else {
        newValue = e.target.textContent || '';
      }

      if (newValue !== this.value) {
        this.$emit('input', newValue);
      }
    },

    handleKeyDown(e) {
      if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.hasAttribute?.('data-variable')) {
        e.preventDefault();
        const variableName = e.target.getAttribute('data-variable');
        const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
        this.$emit('input', this.value.replace(regex, ''));
      }
    }
  }
}
</script>
