/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Mission Control UI - Main Component
 * 
 * React component for mission-oriented autonomous grid intelligence
 */

import React, { useState, useEffect } from 'react';

interface Mission {
  id: string;
  type: string;
  priority: string;
  severity: string;
  status: string;
  description: string;
  affectedAssets: string[];
  createdAt: string;
  timeline: Array<{ eventType: string; description: string; timestamp: string }>;
}

interface MissionControlUIProps {
  missionId?: string;
  onMissionSelect?: (mission: Mission) => void;
}

interface MissionUIState {
  activeMissions: Mission[];
  selectedMission: Mission | null;
  consensus: any;
  rootCause: any;
  recommendations: any;
  scenarios: any;
  loading: boolean;
  error: string | null;
}

/**
 * Mission Control Main Component
 */
export const MissionControl: React.FC<MissionControlUIProps> = ({ missionId, onMissionSelect }) => {
  const [state, setState] = useState<MissionUIState>({
    activeMissions: [],
    selectedMission: null,
    consensus: null,
    rootCause: null,
    recommendations: null,
    scenarios: null,
    loading: false,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<
    'missions' | 'timeline' | 'agents' | 'evidence' | 'scenarios' | 'decision'
  >('missions');

  useEffect(() => {
    loadActiveMissions();
  }, []);

  useEffect(() => {
    if (missionId && state.activeMissions.length > 0) {
      const mission = state.activeMissions.find((m) => m.id === missionId);
      if (mission) {
        selectMission(mission);
      }
    }
  }, [missionId, state.activeMissions]);

  const loadActiveMissions = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/missions');
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        activeMissions: data.missions || [],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: String(error),
        loading: false,
      }));
    }
  };

  const selectMission = async (mission: Mission) => {
    setState((prev) => ({ ...prev, loading: true, selectedMission: mission, error: null }));

    try {
      // Load mission details and analysis in parallel
      const [consensusRes, rootCauseRes, recommendationsRes, scenariosRes] = await Promise.all([
        fetch(`/api/missions/${mission.id}/orchestrate`).then((r) => r.json()),
        fetch(`/api/missions/${mission.id}/analyze-root-cause`).then((r) => r.json()),
        fetch(`/api/missions/${mission.id}/generate-recommendations`).then((r) => r.json()),
        fetch(`/api/missions/${mission.id}/scenarios`).then((r) => r.json()),
      ]);

      setState((prev) => ({
        ...prev,
        selectedMission: mission,
        consensus: consensusRes.consensus,
        rootCause: rootCauseRes.analysis,
        recommendations: recommendationsRes.recommendations,
        scenarios: scenariosRes.comparison,
        loading: false,
      }));

      if (onMissionSelect) {
        onMissionSelect(mission);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: String(error),
        loading: false,
      }));
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'P0':
        return '#ff3333';
      case 'P1':
        return '#ff9933';
      case 'P2':
        return '#ffcc33';
      case 'P3':
        return '#33cc33';
      default:
        return '#999999';
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="mission-control-container">
      <header className="mission-control-header">
        <h1>🎯 MISSION CONTROL CENTER</h1>
        <div className="header-stats">
          <span className="stat">
            <strong>{state.activeMissions.length}</strong> Active Missions
          </span>
          <span className="stat">
            <strong>{state.activeMissions.filter((m) => m.priority === 'P0').length}</strong> Critical
          </span>
        </div>
      </header>

      <div className="mission-control-layout">
        {/* Left Panel - Mission List */}
        <div className="mission-list-panel">
          <div className="panel-header">
            <h2>Active Missions</h2>
            <button className="btn btn-sm" onClick={loadActiveMissions}>
              🔄 Refresh
            </button>
          </div>

          <div className="mission-list">
            {state.loading && !state.selectedMission ? (
              <div className="loading">Loading missions...</div>
            ) : state.activeMissions.length === 0 ? (
              <div className="empty">No active missions</div>
            ) : (
              state.activeMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`mission-item ${
                    state.selectedMission?.id === mission.id ? 'active' : ''
                  }`}
                  onClick={() => selectMission(mission)}
                  style={{ borderLeftColor: getPriorityColor(mission.priority) }}
                >
                  <div className="mission-item-header">
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(mission.priority) }}
                    >
                      {mission.priority}
                    </span>
                    <span className="mission-type">{mission.type}</span>
                    <span className="mission-time">{formatTime(mission.createdAt)}</span>
                  </div>
                  <div className="mission-item-body">
                    <p className="mission-description">{mission.description}</p>
                    <p className="mission-assets">
                      {mission.affectedAssets.length} assets affected
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Mission Details */}
        <div className="mission-details-panel">
          {!state.selectedMission ? (
            <div className="empty-state">
              <p>Select a mission to view details</p>
            </div>
          ) : state.loading ? (
            <div className="loading">Loading mission data...</div>
          ) : (
            <>
              <div className="details-header">
                <h2>{state.selectedMission.type}</h2>
                <div className="details-metadata">
                  <span>Priority: {state.selectedMission.priority}</span>
                  <span>Severity: {state.selectedMission.severity}</span>
                  <span>Status: {state.selectedMission.status}</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button
                  className={`tab ${activeTab === 'missions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('missions')}
                >
                  📊 Overview
                </button>
                <button
                  className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  ⏱️ Timeline
                </button>
                <button
                  className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('agents')}
                >
                  🤖 Agents
                </button>
                <button
                  className={`tab ${activeTab === 'evidence' ? 'active' : ''}`}
                  onClick={() => setActiveTab('evidence')}
                >
                  🔍 Evidence
                </button>
                <button
                  className={`tab ${activeTab === 'scenarios' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scenarios')}
                >
                  📈 Scenarios
                </button>
                <button
                  className={`tab ${activeTab === 'decision' ? 'active' : ''}`}
                  onClick={() => setActiveTab('decision')}
                >
                  ✓ Decision
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'missions' && (
                  <MissionOverviewTab mission={state.selectedMission} />
                )}
                {activeTab === 'timeline' && <TimelineTab mission={state.selectedMission} />}
                {activeTab === 'agents' && <AgentActivityTab consensus={state.consensus} />}
                {activeTab === 'evidence' && (
                  <EvidenceTab rootCause={state.rootCause} graph={null} />
                )}
                {activeTab === 'scenarios' && <ScenarioTab scenarios={state.scenarios} />}
                {activeTab === 'decision' && (
                  <DecisionTab
                    recommendations={state.recommendations}
                    missionId={state.selectedMission?.id}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Mission Overview Tab
 */
const MissionOverviewTab: React.FC<{ mission: Mission }> = ({ mission }) => (
  <div className="tab-pane">
    <div className="overview-section">
      <h3>Mission Details</h3>
      <table className="details-table">
        <tbody>
          <tr>
            <td>Mission ID:</td>
            <td className="mono">{mission.id}</td>
          </tr>
          <tr>
            <td>Type:</td>
            <td>{mission.type}</td>
          </tr>
          <tr>
            <td>Severity:</td>
            <td>{mission.severity}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td>{mission.status}</td>
          </tr>
          <tr>
            <td>Description:</td>
            <td>{mission.description}</td>
          </tr>
          <tr>
            <td>Affected Assets:</td>
            <td>{mission.affectedAssets.join(', ')}</td>
          </tr>
          <tr>
            <td>Created:</td>
            <td>{new Date(mission.createdAt).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Timeline Tab
 */
const TimelineTab: React.FC<{ mission: Mission }> = ({ mission }) => (
  <div className="tab-pane">
    <h3>Mission Timeline</h3>
    <div className="timeline">
      {mission.timeline.map((event, idx) => (
        <div key={idx} className="timeline-event">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <strong>{event.eventType}</strong>
            <p>{event.description}</p>
            <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Agent Activity Tab
 */
const AgentActivityTab: React.FC<{ consensus?: any }> = ({ consensus }) => (
  <div className="tab-pane">
    <h3>Agent Investigation Status</h3>
    {consensus ? (
      <div className="agent-results">
        <div className="consensus-summary">
          <h4>Consensus Finding: {consensus.finding}</h4>
          <p>{consensus.evidence}</p>
        </div>
        <div className="agent-list">
          {consensus.agentAgreement &&
            Object.entries(consensus.agentAgreement).map(([agent, agreement]: [string, any]) => (
              <div key={agent} className="agent-card">
                <span className="agent-name">{agent}</span>
                <span className={`agreement-badge ${agreement ? 'agree' : 'disagree'}`}>
                  {agreement ? '✓ Agree' : '✗ Disagree'}
                </span>
              </div>
            ))}
        </div>
      </div>
    ) : (
      <div className="empty">No agent data available</div>
    )}
  </div>
);

/**
 * Evidence Tab
 */
const EvidenceTab: React.FC<{ rootCause?: any; graph?: any }> = ({ rootCause, graph }) => (
  <div className="tab-pane">
    <h3>Root Cause Analysis</h3>
    {rootCause ? (
      <div className="root-cause-panel">
        <h4>{rootCause.primaryHypothesis.title}</h4>
        <p>{rootCause.primaryHypothesis.description}</p>
        <div className="hypothesis-details">
          <div className="detail-row">
            <span>Confidence:</span>
            <strong>{rootCause.confidence}%</strong>
          </div>
          <div className="detail-row">
            <span>Evidence For:</span>
            <p>{rootCause.primaryHypothesis.evidenceFor.join(', ')}</p>
          </div>
          <div className="detail-row">
            <span>Evidence Against:</span>
            <p>{rootCause.primaryHypothesis.evidenceAgainst.join(', ')}</p>
          </div>
          <div className="detail-row">
            <span>Required Verification:</span>
            <p>{rootCause.primaryHypothesis.requiredVerification.join(', ')}</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="empty">No root cause analysis available</div>
    )}
  </div>
);

/**
 * Scenario Tab
 */
const ScenarioTab: React.FC<{ scenarios?: any }> = ({ scenarios }) => (
  <div className="tab-pane">
    <h3>Scenario Comparison</h3>
    {scenarios ? (
      <div className="scenario-grid">
        {scenarios.scenarios.map((scenario: any, idx: number) => (
          <div key={idx} className="scenario-card">
            <h4>{scenario.name}</h4>
            <p className="scenario-description">{scenario.description}</p>
            <table className="scenario-metrics">
              <tbody>
                <tr>
                  <td>Risk Level:</td>
                  <td>{scenario.riskLevel}</td>
                </tr>
                <tr>
                  <td>Timeframe:</td>
                  <td>{scenario.timeframe}</td>
                </tr>
                <tr>
                  <td>Stability:</td>
                  <td>{scenario.keyMetrics.systemStability}</td>
                </tr>
                <tr>
                  <td>Customer Impact:</td>
                  <td>{scenario.gridMetrics.affectedCustomers}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty">No scenarios available</div>
    )}
  </div>
);

/**
 * Decision Tab
 */
const DecisionTab: React.FC<{ recommendations?: any; missionId?: string }> = ({
  recommendations,
  missionId,
}) => {
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');

  const handleApprove = async () => {
    setApprovalStatus('approved');
  };

  const handleReject = async () => {
    setApprovalStatus('rejected');
  };

  return (
    <div className="tab-pane">
      <h3>Decision &amp; Approval</h3>
      {recommendations ? (
        <div className="decision-panel">
          <div className="recommendation-section best">
            <h4>🏆 Recommended Option</h4>
            <div className="recommendation-card">
              <h5>{recommendations.bestOption.title}</h5>
              <p>{recommendations.bestOption.description}</p>
              <div className="recommendation-metrics">
                <div className="metric">
                  <span>Expected Benefit:</span>
                  <strong>{recommendations.bestOption.expectedBenefit}%</strong>
                </div>
                <div className="metric">
                  <span>Risk:</span>
                  <strong>{recommendations.bestOption.risk}%</strong>
                </div>
                <div className="metric">
                  <span>Confidence:</span>
                  <strong>{recommendations.bestOption.confidence}%</strong>
                </div>
                <div className="metric">
                  <span>Complexity:</span>
                  <strong>{recommendations.bestOption.complexity}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="recommendation-section alternative">
            <h4>🔄 Alternative Option</h4>
            <div className="recommendation-card">
              <h5>{recommendations.alternative?.title || 'N/A'}</h5>
              <p>{recommendations.alternative?.description || 'No alternative available'}</p>
            </div>
          </div>

          <div className="recommendation-section do-nothing">
            <h4>⏸️ Do Nothing</h4>
            <div className="recommendation-card">
              <h5>{recommendations.doNothing.title}</h5>
              <p>{recommendations.doNothing.description}</p>
            </div>
          </div>

          <div className="approval-section">
            <h4>Operator Approval Required</h4>
            <div className={`approval-status status-${approvalStatus}`}>
              Status: <strong>{approvalStatus.toUpperCase()}</strong>
            </div>
            <div className="approval-buttons">
              <button
                className="btn btn-approve"
                onClick={handleApprove}
                disabled={approvalStatus !== 'pending'}
              >
                ✓ Approve
              </button>
              <button
                className="btn btn-reject"
                onClick={handleReject}
                disabled={approvalStatus !== 'pending'}
              >
                ✗ Reject
              </button>
              <button className="btn btn-more-info" disabled={approvalStatus !== 'pending'}>
                ? Request Evidence
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty">No recommendations available</div>
      )}
    </div>
  );
};

export default MissionControl;
