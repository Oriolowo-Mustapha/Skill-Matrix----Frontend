import { useState } from 'react'

const SKILL_MAPS = {
  software: {
    category: 'Software Engineering',
    difficulty: 'Advanced / Intermediate',
    description: 'Design patterns, database optimization, decoupling strategies, and concurrent programming models.',
    nodes: [
      { title: 'Design Patterns', status: 'Ready', desc: 'Creational, structural, and behavioral software construction paradigms.' },
      { title: 'Database Optimization', status: 'Ready', desc: 'Indexing, query plans, caching strategies, and connection pooling models.' },
      { title: 'Dependency Decoupling', status: 'Ready', desc: 'Decoupling components and managing service lifecycles across subsystems.' },
      { title: 'Concurrency Control', status: 'Locked', desc: 'Asynchronous workflows, race condition prevention, and locks.' }
    ]
  },
  devops: {
    category: 'Cloud & DevOps',
    difficulty: 'Intermediate',
    description: 'Container orchestration, CI/CD automation pipelines, infrastructure-as-code, and cloud monitoring.',
    nodes: [
      { title: 'Docker Containers', status: 'Ready', desc: 'Multi-stage builds, networking, and volume bindings.' },
      { title: 'GitHub Actions', status: 'Ready', desc: 'Self-hosted runners, automated testing, and release flows.' },
      { title: 'Kubernetes Pods', status: 'Locked', desc: 'Service discovery, ingress routing, and secret management.' },
      { title: 'Terraform IaC', status: 'Locked', desc: 'State tracking, resource dependencies, and modules.' }
    ]
  },
  ai: {
    category: 'Data & AI Systems',
    difficulty: 'Advanced',
    description: 'Vector databases, neural network structures, generative LLM integrations, and embeddings.',
    nodes: [
      { title: 'LLM Prompt Engineering', status: 'Ready', desc: 'Few-shot prompting, system instructions, and schemas.' },
      { title: 'RAG Architecture', status: 'Ready', desc: 'Retrieval Augmented Generation pipelines and document chunking.' },
      { title: 'Vector Embeddings', status: 'Locked', desc: 'Cosine similarity, vector indexes, and database storage.' },
      { title: 'Model Fine-tuning', status: 'Locked', desc: 'Dataset preparation, hyperparameter tuning, and evaluation.' }
    ]
  }
};

export default function SkillsShowcase() {
  const [activeTab, setActiveTab] = useState('software');

  return (
    <section id="matrix-showcase" className="section-wrapper">
      <div className="section-header">
        <span className="section-label">Interactive Path Preview</span>
        <h2 className="section-title">Explore Tech Stack Focus Nodes</h2>
        <p className="section-desc">
          Select specific technology tracks below to view how competencies are grouped, evaluated, and unlocked based on assessment results.
        </p>
      </div>
      <div className="matrix-interactive-section">
        <div className="matrix-nav">
          {Object.keys(SKILL_MAPS).map((key) => (
            <button
              key={key}
              className={`matrix-nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <div className="matrix-nav-title">{SKILL_MAPS[key].category}</div>
              <div className="matrix-nav-desc">Target Difficulty: {SKILL_MAPS[key].difficulty}</div>
            </button>
          ))}
        </div>

        <div className="solid-card matrix-viewer">
          <div className="viewer-header">
            <div className="viewer-meta">
              <span className="viewer-difficulty">{SKILL_MAPS[activeTab].difficulty} TRACK</span>
              <h3 style={{ fontSize: '1.5rem' }}>{SKILL_MAPS[activeTab].category}</h3>
            </div>
            <p className="viewer-desc" style={{ maxWidth: '400px', color: 'var(--matrix-text-secondary)' }}>
              {SKILL_MAPS[activeTab].description}
            </p>
          </div>

          <div className="nodes-container">
            {SKILL_MAPS[activeTab].nodes.map((node, index) => (
              <div key={index} className="node-box">
                <div className="node-title-row">
                  <span className="node-title">{node.title}</span>
                  <span className={`node-status-label ${node.status.toLowerCase()}`}>
                    {node.status}
                  </span>
                </div>
                <p className="node-desc">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
