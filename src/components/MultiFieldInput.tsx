import { v4 as uuidv4 } from 'uuid';

interface MultiFieldInputProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onUpdate: (item: T) => void) => React.ReactNode;
  createNew: () => T;
  addLabel?: string;
}

export function MultiFieldInput<T extends { id: string }>({
  label,
  items,
  onChange,
  renderItem,
  createNew,
  addLabel = 'Add'
}: MultiFieldInputProps<T>) {
  const handleUpdate = (index: number, item: T) => {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, { ...createNew(), id: uuidv4() }]);
  };

  return (
    <div className="multi-field">
      <div className="multi-field__header">
        <label className="multi-field__label">{label}</label>
        <button type="button" className="multi-field__add-btn" onClick={handleAdd}>
          + {addLabel}
        </button>
      </div>
      <div className="multi-field__list">
        {items.map((item, index) => (
          <div key={item.id} className="multi-field__item">
            {renderItem(item, index, (updated) => handleUpdate(index, updated))}
            <button
              type="button"
              className="multi-field__remove-btn"
              onClick={() => handleRemove(index)}
              aria-label="Remove"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
