import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../../api/axios'
import { toast } from 'react-hot-toast'
import PageHeader from '../../../components/common/PageHeader'
import PathListSidebar from '../../../components/path-builder/PathListSidebar'
import PathDetailPane from '../../../components/path-builder/PathDetailPane'
import PathModal from '../../../components/path-builder/PathModal'
import TrackModal from '../../../components/path-builder/TrackModal'
import SkillModal from '../../../components/path-builder/SkillModal'

export default function PathBuilder() {
  const [careerPaths, setCareerPaths] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [isPathModalOpen, setIsPathModalOpen] = useState(false)
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Forms
  const [pathForm, setPathForm] = useState({ title: '', description: '', image: null })
  const [trackForm, setTrackForm] = useState({ title: '', description: '', image: null })
  const [skillForm, setSkillForm] = useState({ trackId: '', skillId: '', requiredLevel: 0 })

  const fetchInitialData = useCallback(async () => {
    try {
      const [pathsRes, skillsRes] = await Promise.all([
        apiClient.get('/api/CareerPaths'),
        apiClient.get('/api/Skills')
      ])
      setCareerPaths(pathsRes || [])
      setAllSkills(skillsRes || [])
    } catch {
      setError('Failed to load career paths.')
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const [pathsRes, skillsRes] = await Promise.all([
          apiClient.get('/api/CareerPaths'),
          apiClient.get('/api/Skills')
        ])
        if (isMounted) {
          setCareerPaths(pathsRes || [])
          setAllSkills(skillsRes || [])
        }
      } catch {
        if (isMounted) setError('Failed to load career paths.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const handleSelectPath = async (id) => {
    try {
      const res = await apiClient.get(`/api/CareerPaths/${id}`)
      setSelectedPath(res)
    } catch {
      toast.error('Failed to load path details')
    }
  }

  // --- Handlers for Career Path ---
  const handleCreatePath = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('Title', pathForm.title)
      formData.append('Description', pathForm.description)
      if (pathForm.image) formData.append('Image', pathForm.image)

      await apiClient.post('/api/CareerPaths', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        showSuccessToast: true
      })
      
      setIsPathModalOpen(false)
      setPathForm({ title: '', description: '', image: null })
      fetchInitialData()
    } catch {
      toast.error('Failed to create career path')
    } finally {
      setSaving(false)
    }
  }

  // --- Handlers for Tracks ---
  const handleCreateTrack = async (e) => {
    e.preventDefault()
    if (!selectedPath) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('CareerPathId', selectedPath.id)
      formData.append('Name', trackForm.title)
      formData.append('Description', trackForm.description)
      if (trackForm.image) formData.append('Image', trackForm.image)

      await apiClient.post(`/api/CareerPaths/${selectedPath.id}/tracks`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        showSuccessToast: true
      })
      
      setIsTrackModalOpen(false)
      setTrackForm({ title: '', description: '', image: null })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to create track')
    } finally {
      setSaving(false)
    }
  }

  // --- Handlers for Skills ---
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!selectedPath) return
    setSaving(true)
    try {
      await apiClient.post(`/api/CareerPaths/${selectedPath.id}/tracks/${skillForm.trackId}/skills`, {
        careerPathId: selectedPath.id,
        trackId: skillForm.trackId,
        skillId: skillForm.skillId,
        targetLevel: parseInt(skillForm.requiredLevel)
      }, { showSuccessToast: true })
      
      setIsSkillModalOpen(false)
      setSkillForm({ trackId: '', skillId: '', requiredLevel: 0 })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to add skill')
    } finally {
      setSaving(false)
    }
  }

  const openSkillModalForTrack = (trackId) => {
    setSkillForm({ ...skillForm, trackId, skillId: '', requiredLevel: 0 })
    setIsSkillModalOpen(true)
  }

  // --- Handlers for Deletions ---
  const handleDeletePath = async (id) => {
    if (!window.confirm("Are you sure you want to delete this career path?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${id}`, { showSuccessToast: true })
      if (selectedPath?.id === id) setSelectedPath(null)
      fetchInitialData()
    } catch {
      toast.error('Failed to delete path')
    }
  }

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${selectedPath.id}/tracks/${trackId}`, { showSuccessToast: true })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to delete track')
    }
  }

  const handleDeleteSkill = async (trackId, skillId) => {
    if (!window.confirm("Are you sure you want to remove this skill from the track?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${selectedPath.id}/tracks/${trackId}/skills/${skillId}`, { showSuccessToast: true })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading architect...</p>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <PageHeader 
        title="Career Path Architect"
        subtitle="Design organizational paths, tracks, and map required skills."
      />

      {error && (
        <div className="dashboard-alert dashboard-alert-error">
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: '600px', height: 'calc(100vh - 220px)', maxHeight: '750px' }}>
        {/* Left Pane: Paths List */}
        <PathListSidebar 
          careerPaths={careerPaths}
          selectedPath={selectedPath}
          onSelectPath={handleSelectPath}
          onDeletePath={handleDeletePath}
          onOpenCreateModal={() => setIsPathModalOpen(true)}
        />

        {/* Right Pane: Selected Path Details */}
        <PathDetailPane 
          selectedPath={selectedPath}
          onOpenTrackModal={() => setIsTrackModalOpen(true)}
          onDeleteTrack={handleDeleteTrack}
          onOpenSkillModalForTrack={openSkillModalForTrack}
          onDeleteSkill={handleDeleteSkill}
        />
      </div>

      {/* Modals */}
      <PathModal 
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onSubmit={handleCreatePath}
        formState={pathForm}
        setFormState={setPathForm}
        saving={saving}
      />

      <TrackModal 
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onSubmit={handleCreateTrack}
        selectedPathTitle={selectedPath?.title}
        formState={trackForm}
        setFormState={setTrackForm}
        saving={saving}
      />

      <SkillModal 
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSubmit={handleAddSkill}
        allSkills={allSkills}
        formState={skillForm}
        setFormState={setSkillForm}
        saving={saving}
      />
    </div>
  )
}
