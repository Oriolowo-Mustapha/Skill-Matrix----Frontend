export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="dashboard-header-row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 className="dashboard-section-title">{title}</h2>
        {subtitle && <p className="dashboard-section-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  )
}
