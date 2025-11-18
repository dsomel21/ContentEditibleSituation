<template>
  <div class="container">
    <h1>Quick Vue Playground</h1>

    <Popover
      :isOpen="popoverState.isOpen"
      :tagValue="popoverState.tagValue"
      :tagName="tagNames[popoverState.tagValue]"
      :fallbackValue="fallbacks[popoverState.tagValue] || ''"
      @close="closePopover"
      @fallback-change="handleFallbackChange"
    />

    <div class="tags-demo">
      <h3>Test Tags:</h3>
      <div class="tags-container">
        <Tag
          value="firstName"
          :fallback="fallbacks.firstName"
          :isClosable="true"
          @click="handleTagClick('firstName')"
          @close="handleTagClose('First Name', 'firstName')"
        />
        <Tag
          value="lastName"
          :fallback="fallbacks.lastName"
          :isClosable="true"
          @click="handleTagClick('lastName')"
          @close="handleTagClose('Last Name', 'lastName')"
        />
        <Tag
          value="email"
          :fallback="fallbacks.email"
          :isClosable="true"
          @click="handleTagClick('email')"
          @close="handleTagClose('Email Address', 'email')"
        />
      </div>
    </div>

    <div class="input-section">
      <InputLikeDiv
        :placeholder="placeholderText"
        :value="inputValue"
        :fallbacks="fallbacks"
        @input="inputValue = $event"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>

<script>
import Tag from './components/Tag.vue'
import InputLikeDiv from './components/InputLikeDiv.vue'
import Popover from './components/Popover.vue'

const TAG_NAMES = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address'
};

export default {
  name: 'App',
  components: {
    Tag,
    InputLikeDiv,
    Popover
  },
  data() {
    return {
      inputValue: '',
      placeholderText: 'Type something like: Hello {{firstName}}',
      fallbacks: {
        firstName: '',
        lastName: '',
        email: ''
      },
      popoverState: {
        isOpen: false,
        tagValue: null
      },
      tagNames: TAG_NAMES
    }
  },
  methods: {
    handleTagClick(tagValue) {
      this.popoverState = { isOpen: true, tagValue };
    },
    handleTagClose(tagName, tagValue) {
      const regex = new RegExp(`\\{\\{${tagValue}\\}\\}`, 'g');
      this.inputValue = this.inputValue.replace(regex, '');
    },
    handleFallbackChange(tagValue, newFallback) {
      this.fallbacks[tagValue] = newFallback;
    },
    closePopover() {
      this.popoverState = { isOpen: false, tagValue: null };
    }
  }
}
</script>
