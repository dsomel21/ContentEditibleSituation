const { useState, useRef, useEffect } = React;

// Tag name mapping
const TAG_NAMES = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address'
};

// Popover Component
function Popover({ isOpen, onClose, tagValue, tagName, fallbackValue, onFallbackChange }) {
  if (!isOpen) return null;

  return (
    <div className="popover-overlay" onClick={onClose}>
      <div className="popover" onClick={(e) => e.stopPropagation()}>
        <h4>Set fallback for {tagName}</h4>
        <input
          type="text"
          className="popover-input"
          placeholder="Enter fallback value"
          value={fallbackValue}
          onChange={(e) => onFallbackChange(tagValue, e.target.value)}
          autoFocus
        />
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Tag Component
function Tag({ value, fallback, isClosable = false, onClose, onClick }) {
  const tagName = TAG_NAMES[value] || value;
  const displayValue = fallback ? `${tagName} | ${fallback}` : tagName;

  return (
    <span
      className="tag tag-blue"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{ cursor: 'pointer' }}
      contentEditable={false}
    >
      {displayValue}
      {isClosable && (
        <button
          className="tag-close"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose?.(); }}
          contentEditable={false}
        >
          ×
        </button>
      )}
    </span>
  );
}

// Input-like Div Component
function InputLikeDiv({ placeholder, value, onChange, fallbacks, onTagClick }) {
  const divRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const tagRootsRef = useRef([]);

  // Parse value into text and variable parts
  const parseValue = (val) => {
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
  };

  // Render value with Tags
  const renderValue = (val) => {
    if (!divRef.current) return;

    // Cleanup old React roots
    tagRootsRef.current.forEach(root => root.unmount());
    tagRootsRef.current = [];

    divRef.current.innerHTML = '';
    const parts = parseValue(val);

    parts.forEach((part) => {
      if (part.type === 'variable') {
        const container = document.createElement('span');
        container.setAttribute('data-variable', part.name);
        container.contentEditable = false;
        divRef.current.appendChild(container);

        const root = ReactDOM.createRoot(container);
        tagRootsRef.current.push(root);
        root.render(
          <Tag
            value={part.name}
            fallback={fallbacks?.[part.name]}
            isClosable={true}
            onClose={() => onChange(value.replace(new RegExp(`\\{\\{${part.name}\\}\\}`, 'g'), ''))}
            onClick={() => onTagClick?.(part.name)}
          />
        );
      } else {
        divRef.current.appendChild(document.createTextNode(part.content));
      }
    });
  };

  // Update DOM when value changes - but only if it contains {{variable}} patterns
  useEffect(() => {
    if (!isUpdatingRef.current && divRef.current && /\{\{\w+\}\}/.test(value)) {
      renderValue(value, fallbacks);
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => () => tagRootsRef.current.forEach(root => root.unmount()), []);

  const handleInput = (e) => {
    if (isUpdatingRef.current) return;
    
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
    
    // Only update if different - let useEffect handle rendering Tags
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    // TODO: Handle Backspace/Delete on Tags more gracefully
    if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.hasAttribute?.('data-variable')) {
      e.preventDefault();
      onChange(value.replace(new RegExp(`\\{\\{${e.target.getAttribute('data-variable')}\\}\\}`, 'g'), ''));
    }
  };

  return (
    <div
      ref={divRef}
      className="input-like-div"
      contentEditable
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={!value?.trim() ? placeholder : ''}
      suppressContentEditableWarning={true}
    />
  );
}

// Example App
function App() {
  const [inputValue, setInputValue] = useState('');
  const [fallbacks, setFallbacks] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [popoverState, setPopoverState] = useState({ isOpen: false, tagValue: null });

  const handleTagClick = (tagValue) => {
    setPopoverState({ isOpen: true, tagValue });
  };

  const handleTagClose = (tagName, tagValue) => {
    const newValue = inputValue.replace(new RegExp(`\\{\\{${tagValue}\\}\\}`, 'g'), '');
    setInputValue(newValue);
  };

  const handleFallbackChange = (tagValue, newFallback) => {
    setFallbacks(prev => ({ ...prev, [tagValue]: newFallback }));
  };

  const closePopover = () => {
    setPopoverState({ isOpen: false, tagValue: null });
  };

  // Create JSON state for display
  const stateJSON = JSON.stringify({
    inputValue,
    fallbacks,
    popoverState
  }, null, 2);

  return (
    <div className="container">
      <Popover
        isOpen={popoverState.isOpen}
        onClose={closePopover}
        tagValue={popoverState.tagValue}
        tagName={TAG_NAMES[popoverState.tagValue]}
        fallbackValue={fallbacks[popoverState.tagValue] || ''}
        onFallbackChange={handleFallbackChange}
      />

      <div className="main-content">
        <div className="left-panel">
          <h1>Quick <span className="react-brand">React</span> Playground</h1>

          <div className="tags-demo">
            <h3>Test Tags:</h3>
            <div className="tags-container">
              <Tag
                value="firstName"
                fallback={fallbacks.firstName}
                isClosable={true}
                onClick={() => handleTagClick('firstName')}
                onClose={() => handleTagClose('First Name', 'firstName')}
              />
              <Tag
                value="lastName"
                fallback={fallbacks.lastName}
                isClosable={true}
                onClick={() => handleTagClick('lastName')}
                onClose={() => handleTagClose('Last Name', 'lastName')}
              />
              <Tag
                value="email"
                fallback={fallbacks.email}
                isClosable={true}
                onClick={() => handleTagClick('email')}
                onClose={() => handleTagClose('Email Address', 'email')}
              />
            </div>
          </div>

          <div className="input-section">
            <InputLikeDiv
              placeholder="Type something like: Hello {{firstName}}"
              value={inputValue}
              onChange={setInputValue}
              fallbacks={fallbacks}
              onTagClick={handleTagClick}
            />
          </div>
        </div>

        <div className="right-panel">
          <h3>Live State (JSON)</h3>
          <pre className="state-display"><code>{stateJSON}</code></pre>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('react-app'));
root.render(<App />);
