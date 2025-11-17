const { useState, useRef, useEffect } = React;

// Helper function to convert camelCase to "Title Case"
function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

// Tag Component
function Tag({ value, isClosable = false, onClose, onClick }) {
  return (
    <span 
      className="tag tag-blue" 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{ cursor: 'pointer' }}
      contentEditable={false}
    >
      {toTitleCase(value)}
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
function InputLikeDiv({ placeholder, value, onChange }) {
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
            isClosable={true}
            onClose={() => onChange(value.replace(new RegExp(`\\{\\{${part.name}\\}\\}`, 'g'), ''))}
            onClick={() => alert(`Clicked on ${toTitleCase(part.name)}`)}  
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
      renderValue(value);
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

  return (
    <div className="container">
      <h1>Quick React Playground</h1>

      <div className="input-section">
        <InputLikeDiv
          placeholder="Type something like: hello {{firstName}}"
          value={inputValue}
          onChange={setInputValue}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('react-app'));
root.render(<App />);
