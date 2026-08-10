import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../../api/axios'
import { toast } from 'react-hot-toast'
import RegisterMemberModal from '../../../components/team/RegisterMemberModal'
import AssignPathModal from '../../../components/team/AssignPathModal'
import AssignSkillModal from '../../../components/team/AssignSkillModal'

export default function TeamManagement() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', userName: '', password: ''
  })
  const [validationErrors, setValidationErrors] = useState({})

  // Assign Path Modal State
  const [careerPaths, setCareerPaths] = useState([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignForm, setAssignForm] = useState({ teamMemberId: '', careerPathId: '', trackId: '' })

  // Assign Skill Modal State
  const [allSkills, setAllSkills] = useState([])
  const [isAssignSkillModalOpen, setIsAssignSkillModalOpen] = useState(false)
  const [assignSkillForm, setAssignSkillForm] = useState({ teamMemberId: '', skillId: '' })

  const fetchMembersAndPaths = async () => {
    setLoading(true)
    setError('')
    try {
      const [membersRes, pathsRes, skillsRes] = await Promise.all([
        apiClient.get('/api/Teams/members'),
        apiClient.get('/api/CareerPaths'),
        apiClient.get('/api/Skills')
      ])
      setMembers(membersRes || [])
      setCareerPaths(pathsRes || [])
      setAllSkills(skillsRes || [])
    } catch {
      setError('Failed to load team data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembersAndPaths()
  }, [])

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this team member? This action cannot be undone.")) return
    try {
      await apiClient.delete(`/api/Teams/members/${id}`, { showSuccessToast: true })
      setMembers(members.filter(m => m.id !== id))
    } catch {
      toast.error('Failed to delete team member.')
    }
  }

  const handleAssignClick = (memberId) => {
    setAssignForm({ teamMemberId: memberId, careerPathId: '', trackId: '' })
    setIsAssignModalOpen(true)
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        teamMemberId: assignForm.teamMemberId,
        careerPathId: assignForm.careerPathId
      }
      if (assignForm.trackId) {
        payload.trackId = assignForm.trackId
      }
      await apiClient.post('/api/CareerPaths/assign-team-member', payload, { showSuccessToast: true })
      setIsAssignModalOpen(false)
      fetchMembersAndPaths()
    } catch {
      toast.error('Failed to assign career path.')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignSkillClick = (memberId) => {
    setAssignSkillForm({ teamMemberId: memberId, skillId: '' })
    setIsAssignSkillModalOpen(true)
  }

  const handleAssignSkillSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/api/Skills/assign', {
        teamMemberId: assignSkillForm.teamMemberId,
        skillId: assignSkillForm.skillId
      }, { showSuccessToast: true })
      setIsAssignSkillModalOpen(false)
    } catch {
      toast.error('Failed to assign skill.')
    } finally {
      setSaving(false)
    }
  }

  const selectedMember = members.find(m => m.id === assignForm.teamMemberId)
  const selectedPathDetails = careerPaths.find(p => p.id === assignForm.careerPathId)
  
  // Filter out career paths that the user is already assigned to
  const availableCareerPaths = careerPaths.filter(
    path => !selectedMember?.assignedCareerPathIds?.includes(path.id)
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setValidationErrors({})
    try {
      await apiClient.post('/api/Teams/register-member', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        userName: form.userName
      }, { showSuccessToast: true })
      
      setIsModalOpen(false)
      setForm({ firstName: '', lastName: '', email: '', userName: '' })
      fetchMembersAndPaths()
    } catch (err) {
      if (err.isValidationError) {
        setValidationErrors(err.errors)
      } else {
        toast.error('Failed to register member')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="dashboard-header-row" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-section-title">Team Directory</h2>
          <p className="dashboard-section-subtitle">Manage your team members and assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path d="M12 5v14M5 12h14"></path></svg>
          Add Member
        </button>
      </div>

      {error && (
        <div className="dashboard-alert dashboard-alert-error" style={{marginBottom: '2rem'}}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="solid-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--matrix-border)', backgroundColor: 'var(--matrix-bg)' }}>
                  <th style={{ padding: '1rem', color: 'var(--matrix-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>NAME</th>
                  <th style={{ padding: '1rem', color: 'var(--matrix-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>EMAIL</th>
                  <th style={{ padding: '1rem', color: 'var(--matrix-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>ROLE</th>
                  <th style={{ padding: '1rem', color: 'var(--matrix-text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--matrix-text-muted)' }}>
                      No team members found. Click "Add Member" to get started.
                    </td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        <Link to={`/dashboard/team/${member.id}`} style={{ color: 'var(--matrix-primary)', textDecoration: 'none' }}>
                          {member.firstName} {member.lastName}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--matrix-text-muted)' }}>{member.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge-pill" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: 'var(--matrix-bg)' }}>
                          {member.role || 'Learner'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={() => handleAssignSkillClick(member.id)}>Assign Skill</button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={() => handleAssignClick(member.id)}>Assign Path</button>
                        <button style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }} onClick={() => handleDeleteMember(member.id)} title="Delete Member">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <RegisterMemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        form={form}
        onInputChange={handleInputChange}
        validationErrors={validationErrors}
        saving={saving}
      />

      <AssignPathModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        availableCareerPaths={availableCareerPaths}
        selectedPathDetails={selectedPathDetails}
        saving={saving}
      />

      <AssignSkillModal 
        isOpen={isAssignSkillModalOpen}
        onClose={() => setIsAssignSkillModalOpen(false)}
        onSubmit={handleAssignSkillSubmit}
        assignSkillForm={assignSkillForm}
        setAssignSkillForm={setAssignSkillForm}
        allSkills={allSkills}
        saving={saving}
      />
    </div>
  )
}
