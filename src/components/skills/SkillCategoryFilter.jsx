export default function SkillCategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory
}) {
  return (
    <div className="dash-skills-categories" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {categories.map(cat => (
        <button 
          key={cat} 
          className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onSelectCategory(cat)}
          style={{
            padding: '0.35rem 0.85rem',
            fontSize: '0.8rem',
            borderRadius: '20px',
            backgroundColor: selectedCategory === cat ? 'rgba(0, 180, 216, 0.2)' : 'var(--matrix-bg-alt)',
            borderColor: selectedCategory === cat ? 'var(--matrix-primary)' : 'var(--matrix-border)',
            color: selectedCategory === cat ? 'var(--matrix-primary)' : 'var(--matrix-text-muted)'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
