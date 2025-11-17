// Helper function to convert camelCase to "Title Case"
function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

// Tag Component
Vue.component('Tag', {
  props: {
    value: String,
    isClosable: {
      type: Boolean,
      default: false
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
  },
  template: `
    <span 
      class="tag tag-blue" 
      @click="handleClick"
      :style="{ cursor: 'pointer' }"
      contenteditable="false"
    >
      {{ titleCaseValue }}
      <button 
        v-if="isClosable"
        class="tag-close" 
        @click="handleClose"
        contenteditable="false"
      >
        ×
      </button>
    </span>
  `,
  computed: {
    titleCaseValue() {
      return toTitleCase(this.value);
    }
  }
});

// Input-like Div Component
Vue.component('InputLikeDiv', {
  props: {
    placeholder: String,
    value: {
      type: String,
      default: ''
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
    // Cleanup Vue instances
    this.tagInstances.forEach(instance => {
      instance.$destroy();
    });
    this.tagInstances = [];
  },
  methods: {
    // Parse value into text and variable parts
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

    // Render value with Tags
    renderValue(val) {
      if (!this.$refs.div) return;

      // Cleanup old Vue instances
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

          // Create Vue instance for Tag component
          const TagComponent = Vue.extend({
            components: { Tag },
            template: `
              <Tag
                :value="tagValue"
                :isClosable="true"
                @close="handleClose"
                @click="handleClick"
              />
            `,
            data() {
              return {
                tagValue: part.name
              };
            },
            methods: {
              handleClose() {
                self.handleRemovingDynamicVariable(part.name);
              },
              handleClick() {
                alert('Clicked on ' + toTitleCase(part.name));
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

    handleRemovingDynamicVariable(variableName) {
      const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
      const newValue = this.value.replace(regex, '');
      this.$emit('input', newValue);
    },

    handleInput(e) {
      if (this.isUpdating) return;
      
      // Read current content
      let newValue = '';
      const childNodes = Array.from(e.target.childNodes);
      const hasTags = childNodes.some(node => 
        node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-variable')
      );
      
      if (hasTags) {
        // Reconstruct: convert Tags back to {{variable}} format
        childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            newValue += node.textContent;
          } else if (node.hasAttribute('data-variable')) {
            newValue += `{{${node.getAttribute('data-variable')}}}`;
          }
        });
      } else {
        // No Tags - user is typing, just read text directly
        newValue = e.target.textContent || '';
      }
      
      // Only update if different - let watch handle rendering Tags
      if (newValue !== this.value) {
        this.$emit('input', newValue);
      }
    },

    handleKeyDown(e) {
      // TODO: Handle Backspace/Delete on Tags more gracefully
      if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.hasAttribute?.('data-variable')) {
        e.preventDefault();
        const variableName = e.target.getAttribute('data-variable');
        const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
        this.$emit('input', this.value.replace(regex, ''));
      }
    }
  },
  template: `
    <div
      ref="div"
      class="input-like-div"
      contenteditable
      @input="handleInput"
      @keydown="handleKeyDown"
      :data-placeholder="!value || !value.trim() ? placeholder : ''"
    />
  `
});

// Example App
new Vue({
  el: '#vue-app',
  data: {
    inputValue: ''
  },
  template: `
    <div class="container">
      <h1>Quick Vue Playground</h1>

      <div class="input-section">
        <InputLikeDiv
          placeholder="Type something like: hello {{firstName}}"
          :value="inputValue"
          @input="inputValue = $event"
        />
      </div>
    </div>
  `
});
