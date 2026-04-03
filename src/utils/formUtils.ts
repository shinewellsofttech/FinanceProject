/**
 * Validates that a string value is non-negative (allows empty, digits, optional decimal).
 * Use in onChange for number inputs to prevent negative values.
 */
export function allowNonNegative(value: string): boolean {
  return value === "" || /^\d*\.?\d*$/.test(value);
}

/**
 * Handles Enter, Tab, and Shift+Tab in master forms: move focus to next/previous field.
 * Enter/Tab = next field; Shift+Tab = previous field.
 * Attach to Form: onKeyDown={handleEnterToNextField}
 * Skip for textarea on Enter so Enter can insert newline.
 */
export function handleEnterToNextField(e: React.KeyboardEvent<HTMLFormElement>): void {
  const isEnter = e.key === "Enter";
  const isTab = e.key === "Tab";
  if (!isEnter && !isTab) return;

  const target = e.target as HTMLElement;
  if (isEnter && target.tagName === "TEXTAREA") return;

  const form = (e.currentTarget || target.closest("form")) as HTMLFormElement | null;
  if (!form) return;

  const focusableSelector =
    'input:not([type="hidden"]):not([type="submit"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
  const inputs = Array.from(form.querySelectorAll<HTMLElement>(focusableSelector));
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const focusables = submitBtn ? [...inputs, submitBtn] : inputs;

  if (focusables.length === 0) return;

  const current = document.activeElement as HTMLElement;
  const idx = focusables.indexOf(current);

  if (isTab && e.shiftKey) {
    if (idx > 0) {
      e.preventDefault();
      focusables[idx - 1].focus();
    } else if (idx === -1) {
      e.preventDefault();
      focusables[focusables.length - 1].focus();
    }
    return;
  }

  if (isTab || isEnter) {
    e.preventDefault();
    if (idx >= 0 && idx < focusables.length - 1) {
      focusables[idx + 1].focus();
    } else if (idx === focusables.length - 1 && submitBtn && !submitBtn.disabled) {
      submitBtn.focus();
    } else if (idx < 0 && inputs.length > 0) {
      focusables[0].focus();
    }
  }
}

/**
 * Global Enter key handler - attaches to document level
 * Moves focus to next field on Enter, or to Save button if on last field
 */
export function initGlobalEnterNavigation(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toUpperCase();
    
    // Skip if target is textarea, button, or not an input element
    if (tagName === "TEXTAREA" || tagName === "BUTTON") return;
    if (tagName !== "INPUT" && tagName !== "SELECT") return;
    
    // Skip if input type is submit
    if (tagName === "INPUT" && (target as HTMLInputElement).type === "submit") return;
    
    // Find parent form
    const form = target.closest("form");
    if (!form) return;
    
    e.preventDefault();
    
    // Get all focusable elements in form
    const focusableSelector =
      'input:not([type="hidden"]):not([type="submit"]):not([disabled]):not([readonly]), ' +
      'select:not([disabled]), ' +
      'textarea:not([disabled]):not([readonly])';
    
    const inputs = Array.from(form.querySelectorAll<HTMLElement>(focusableSelector));
    
    // Find save/submit button - use valid CSS selectors only
    let saveBtn: HTMLButtonElement | null = null;
    
    // Try standard selectors first
    saveBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    
    if (!saveBtn) {
      saveBtn = form.querySelector<HTMLButtonElement>('button.btn-primary');
    }
    
    // If still not found, look for button with save/update/add text or icon
    if (!saveBtn) {
      const allButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('button'));
      saveBtn = allButtons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        const hasIcon = btn.querySelector('.fa-save, .fa-plus') !== null;
        return hasIcon || text.includes('save') || text.includes('update') || text.includes('add') || text.includes('create');
      }) || null;
    }
    
    const focusables = saveBtn ? [...inputs, saveBtn] : inputs;
    
    if (focusables.length === 0) return;
    
    const currentIdx = focusables.indexOf(target);
    
    if (currentIdx >= 0 && currentIdx < focusables.length - 1) {
      // Move to next field
      focusables[currentIdx + 1].focus();
    } else if (currentIdx === focusables.length - 1 || currentIdx === inputs.length - 1) {
      // On last input field - focus save button if exists
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.focus();
      }
    }
  };
  
  document.addEventListener("keydown", handleKeyDown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}
