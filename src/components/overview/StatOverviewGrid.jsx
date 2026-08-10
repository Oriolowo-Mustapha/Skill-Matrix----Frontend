export default function StatOverviewGrid({
  userAssignedSkillsCount = 0,
  masteredSkillsCount = 0,
  assignedCareerPathsCount = 0,
  improvementPlansCount = 0,
  totalPoints = 0,
  badgesCount = 0
}) {
  return (
    <div className="dash-stats-row">
      <div className="dash-stat-card">
        <span className="dash-stat-value">{userAssignedSkillsCount}</span>
        <span className="dash-stat-label">Assigned Skills ({masteredSkillsCount} Mastered)</span>
      </div>
      <div className="dash-stat-card">
        <span className="dash-stat-value">{assignedCareerPathsCount}</span>
        <span className="dash-stat-label">Active Career Paths</span>
      </div>
      <div className="dash-stat-card">
        <span className="dash-stat-value">{improvementPlansCount}</span>
        <span className="dash-stat-label">Active Growth Plans</span>
      </div>
      <div className="dash-stat-card">
        <span className="dash-stat-value dash-stat-accent">{totalPoints} XP</span>
        <span className="dash-stat-label">{badgesCount} Badges Earned</span>
      </div>
    </div>
  )
}
