// Drag and drop hook for JavaScript

function useDragDrop(element, options = {}) {
  const {
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    dragClass = 'dragging',
    dropClass = 'drop-target'
  } = options;

  // State variables
  let isDragging = false;
  let dragData = null;

  // Get the element if it's a selector
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;

  // Drag start handler
  function handleDragStart(e) {
    isDragging = true;
    e.target.classList.add(dragClass);
    
    // Set drag data
    dragData = e.target.dataset.dragData || null;
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragData || e.target.textContent);
    
    // Call the callback if provided
    if (onDragStart) {
      onDragStart(e, dragData);
    }
  }

  // Drag over handler
  function handleDragOver(e) {
    e.preventDefault(); // Allow drop
    
    // Add drop class to indicate valid drop target
    targetElement.classList.add(dropClass);
    
    // Call the callback if provided
    if (onDragOver) {
      onDragOver(e);
    }
  }

  // Drag leave handler
  function handleDragLeave(e) {
    // Remove drop class when leaving the element
    targetElement.classList.remove(dropClass);
  }

  // Drop handler
  function handleDrop(e) {
    e.preventDefault();
    
    // Remove drop class
    targetElement.classList.remove(dropClass);
    
    dragData = e.dataTransfer.getData('text/plain');
    
    // Call the callback if provided
    if (onDrop) {
      onDrop(e, dragData);
    }
  }

  // Drag end handler
  function handleDragEnd(e) {
    isDragging = false;
    e.target.classList.remove(dragClass);
    
    // Remove dropped element if specified
    if (e.dataTransfer.dropEffect === 'move') {
      e.target.remove();
    }
    
    // Call the callback if provided
    if (onDragEnd) {
      onDragEnd(e);
    }
  }

  // Attach event listeners
  targetElement.setAttribute('draggable', true);
  targetElement.addEventListener('dragstart', handleDragStart);
  targetElement.addEventListener('dragend', handleDragEnd);
  
  if (targetElement !== document && targetElement !== document.body) {
    targetElement.addEventListener('dragover', handleDragOver);
    targetElement.addEventListener('dragleave', handleDragLeave);
    targetElement.addEventListener('drop', handleDrop);
  } else {
    // Add to document if the target is the document
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
  }

  // Return a cleanup function
  return function cleanup() {
    targetElement.removeEventListener('dragstart', handleDragStart);
    targetElement.removeEventListener('dragend', handleDragEnd);
    targetElement.removeEventListener('dragover', handleDragOver);
    targetElement.removeEventListener('dragleave', handleDragLeave);
    targetElement.removeEventListener('drop', handleDrop);
    
    document.removeEventListener('dragover', handleDragOver);
    document.removeEventListener('dragleave', handleDragLeave);
    document.removeEventListener('drop', handleDrop);
  };
}

// Drag and drop list hook
function useDragDropList(listContainer, options = {}) {
  const {
    onReorder,
    itemSelector = '.draggable-item',
    placeholderClass = 'drop-placeholder',
    activeClass = 'drag-active'
  } = options;

  const container = typeof listContainer === 'string' ? document.querySelector(listContainer) : listContainer;
  let dragItem = null;
  let placeholder = null;

  // Create placeholder element
  function createPlaceholder() {
    placeholder = document.createElement('div');
    placeholder.className = placeholderClass;
    return placeholder;
  }

  // Get position of the placeholder relative to other items
  function getPlaceholderPosition(e) {
    const items = Array.from(container.querySelectorAll(itemSelector));
    let closest = null;
    let closestDistance = 10000;

    items.forEach(item => {
      if (item === dragItem) return;

      const box = item.getBoundingClientRect();
      const offset = e.clientY - (box.top + box.height / 2);

      if (Math.abs(offset) < closestDistance) {
        closestDistance = Math.abs(offset);
        closest = item;
        if (offset > 0) closest = item.nextSibling;
      }
    });

    return closest;
  }

  // Handle drag start
  function handleDragStart(e) {
    dragItem = e.target.closest(itemSelector);
    if (!dragItem) return;

    dragItem.classList.add(activeClass);
    container.classList.add(activeClass);
  }

  // Handle drag over
  function handleDragOver(e) {
    e.preventDefault();
    
    if (!placeholder) {
      placeholder = createPlaceholder();
    }

    const closestItem = getPlaceholderPosition(e);
    
    if (closestItem) {
      container.insertBefore(placeholder, closestItem);
    } else {
      container.appendChild(placeholder);
    }
  }

  // Handle drop
  function handleDrop(e) {
    e.preventDefault();

    if (placeholder && dragItem) {
      container.insertBefore(dragItem, placeholder);
      container.removeChild(placeholder);
      placeholder = null;
      
      // Call the reorder callback if provided
      if (onReorder) {
        const items = Array.from(container.querySelectorAll(itemSelector));
        onReorder(items);
      }
    }
  }

  // Handle drag end
  function handleDragEnd() {
    if (dragItem) {
      dragItem.classList.remove(activeClass);
      container.classList.remove(activeClass);
      dragItem = null;
    }
  }

  // Add event listeners to the container
  container.addEventListener('dragstart', handleDragStart);
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', handleDrop);
  container.addEventListener('dragend', handleDragEnd);

  // Make all items draggable
  const items = container.querySelectorAll(itemSelector);
  items.forEach(item => {
    item.setAttribute('draggable', true);
  });

  // Return cleanup function
  return function cleanup() {
    container.removeEventListener('dragstart', handleDragStart);
    container.removeEventListener('dragover', handleDragOver);
    container.removeEventListener('drop', handleDrop);
    container.removeEventListener('dragend', handleDragEnd);
  };
}

// Export the hooks
export { useDragDrop, useDragDropList };