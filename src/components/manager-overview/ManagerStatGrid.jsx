export default function ManagerStatGrid({ analytics }) {
  return (
    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
      <div className="dash-widget solid-card">
        <h3 className="widget-title">Total Members</h3>
        <div className="widget-value">{analytics?.totalMembers || 0}</div>
      </div>
      <div className="dash-widget solid-card">
        <h3 className="widget-title">Assessments Taken</h3>
        <div className="widget-value">{analytics?.activeAssessments || 0}</div>
      </div>
      <div className="dash-widget solid-card">
        <h3 className="widget-title">Avg Proficiency</h3>
        <div className="widget-value">{analytics?.averageProficiency || 0} <span style={{fontSize: '1rem', color: 'var(--matrix-text-muted)'}}>/ 4</span></div>
      </div>
      <div className="dash-widget solid-card">
        <h3 className="widget-title">Active Plans</h3>
        <div className="widget-value">{analytics?.activeImprovementPlans || 0}</div>
      </div>
    </div>
  )
}
