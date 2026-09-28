/**
 * KETRACO COMMAND CENTER - PHASE 08
 * End-to-End Mission Orchestration Test
 * 
 * Full workflow validation: EVENT → MISSION → ORCHESTRATION → ANALYSIS → RECOMMENDATION → APPROVAL → CLOSURE → MEMORY
 */

import { GridMissionEngine } from './mission-engine';
import { GridAgentOrchestrator } from './orchestrator';
import { RootCauseEngine, RecommendationEngine } from './analysis-engines';
import { CausalGraphEngine } from './causal-graph';
import { ScenarioEngine } from './scenarios';
import { ApprovalWorkflow, ApprovalGateManager } from './approvals';
import { MissionMemory } from './mission-memory';
import { GridPlaybooksLibrary } from './playbooks';

/**
 * End-to-End Test Suite
 */
export class MissionE2ETest {
  private missionEngine = GridMissionEngine.getInstance();
  private agentOrchestrator = GridAgentOrchestrator.getInstance();
  private rootCauseEngine = RootCauseEngine.getInstance();
  private recommendationEngine = RecommendationEngine.getInstance();
  private causalGraphEngine = CausalGraphEngine.getInstance();
  private scenarioEngine = ScenarioEngine.getInstance();
  private approvalWorkflow = ApprovalWorkflow.getInstance();
  private approvalGateManager = ApprovalGateManager.getInstance();
  private missionMemory = MissionMemory.getInstance();
  private playbooksLibrary = GridPlaybooksLibrary.getInstance();

  private testResults: Array<{ test: string; status: string; duration: number; message?: string }> = [];

  /**
   * Run full E2E test
   */
  public async runFullE2ETest(): Promise<boolean> {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 PHASE 08 END-TO-END MISSION ORCHESTRATION TEST');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let success = true;

    try {
      // 1. Create event
      success =
        (await this.testCreateEvent()) &&
        success;

      // 2. Create mission from event
      success =
        (await this.testCreateMission()) &&
        success;

      // 3. Orchestrate multi-agent investigation
      success =
        (await this.testMissionOrchestration()) &&
        success;

      // 4. Analyze root cause
      success =
        (await this.testRootCauseAnalysis()) &&
        success;

      // 5. Generate recommendations
      success =
        (await this.testRecommendationGeneration()) &&
        success;

      // 6. Build causal graph
      success =
        (await this.testCausalGraphGeneration()) &&
        success;

      // 7. Generate scenarios
      success =
        (await this.testScenarioGeneration()) &&
        success;

      // 8. Approval workflow
      success =
        (await this.testApprovalWorkflow()) &&
        success;

      // 9. Mission memory recording
      success =
        (await this.testMissionMemory()) &&
        success;

      // 10. Playbook recommendation
      success =
        (await this.testPlaybookRecommendation()) &&
        success;
    } catch (error) {
      console.error('❌ FATAL TEST ERROR:', error);
      success = false;
    }

    // Print summary
    this.printTestSummary();

    return success;
  }

  /**
   * Test 1: Create Event
   */
  private async testCreateEvent(): Promise<boolean> {
    const startTime = Date.now();
    console.log('1️⃣  TEST: Create Event');

    try {
      const event = {
        eventType: 'FREQUENCY_DEVIATION',
        timestamp: new Date().toISOString(),
        severity: 'HIGH',
        value: 59.2,
        assetId: 'SUBSTATION_MAIN_001',
        description: 'Frequency dropped to 59.2 Hz - possible generation loss',
      };

      console.log('   - Event created:', event.eventType);
      this.recordTest('Create Event', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Create Event', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 2: Create Mission
   */
  private async testCreateMission(): Promise<boolean> {
    const startTime = Date.now();
    console.log('2️⃣  TEST: Create Mission from Event');

    try {
      const event = {
        eventType: 'FREQUENCY_DEVIATION',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        value: 58.8,
        assetId: 'GENERATOR_LARGE_001',
        description: 'Large generator tripped - cascade risk',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);

      console.log('   ✓ Mission created:', mission.id);
      console.log('   ✓ Type:', mission.type);
      console.log('   ✓ Priority:', mission.priority);
      console.log('   ✓ Severity:', mission.severity);

      if (!mission.id || !mission.type) {
        throw new Error('Mission missing required fields');
      }

      this.recordTest('Create Mission', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Create Mission', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 3: Mission Orchestration
   */
  private async testMissionOrchestration(): Promise<boolean> {
    const startTime = Date.now();
    console.log('3️⃣  TEST: Multi-Agent Orchestration');

    try {
      const event = {
        eventType: 'CASCADE_RISK_DETECTED',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const consensus = await this.agentOrchestrator.orchestrateMission(mission);

      console.log('   ✓ Orchestration completed');
      console.log('   ✓ Finding:', consensus.finding);
      console.log('   ✓ Confidence:', consensus.confidence, '%');
      console.log('   ✓ Agent count:', Object.keys(consensus.agentAgreement).length);

      if (!consensus.finding || consensus.confidence === 0) {
        throw new Error('Invalid consensus results');
      }

      this.recordTest('Multi-Agent Orchestration', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Multi-Agent Orchestration', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 4: Root Cause Analysis
   */
  private async testRootCauseAnalysis(): Promise<boolean> {
    const startTime = Date.now();
    console.log('4️⃣  TEST: Root Cause Analysis');

    try {
      const event = {
        eventType: 'CRITICAL_OUTAGE',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const analysis = await this.rootCauseEngine.analyze(mission);

      console.log('   ✓ Root cause analysis completed');
      console.log('   ✓ Primary hypothesis:', analysis.primaryHypothesis.title);
      console.log('   ✓ Confidence:', analysis.confidence, '%');
      console.log('   ✓ Hypotheses ranked:', analysis.hypotheses.length);
      console.log('   ✓ Missing evidence:', analysis.missingEvidence.length, 'items');

      if (!analysis.primaryHypothesis || analysis.confidence === 0) {
        throw new Error('Invalid root cause analysis');
      }

      this.recordTest('Root Cause Analysis', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Root Cause Analysis', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 5: Recommendation Generation
   */
  private async testRecommendationGeneration(): Promise<boolean> {
    const startTime = Date.now();
    console.log('5️⃣  TEST: Recommendation Generation');

    try {
      const event = {
        eventType: 'CRITICAL_OUTAGE',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const recommendations = await this.recommendationEngine.generateRecommendations(mission);

      console.log('   ✓ Recommendations generated');
      console.log('   ✓ Best option:', recommendations.bestOption.title);
      console.log('   ✓ Expected benefit:', recommendations.bestOption.expectedBenefit, '%');
      console.log('   ✓ Risk level:', recommendations.bestOption.risk, '%');
      console.log('   ✓ Alternatives:', recommendations.allRanked.length);

      if (!recommendations.bestOption || !recommendations.doNothing) {
        throw new Error('Invalid recommendations');
      }

      this.recordTest('Recommendation Generation', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Recommendation Generation', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 6: Causal Graph Generation
   */
  private async testCausalGraphGeneration(): Promise<boolean> {
    const startTime = Date.now();
    console.log('6️⃣  TEST: Causal Graph Generation');

    try {
      const event = {
        eventType: 'CRITICAL_OUTAGE',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const analysis = await this.rootCauseEngine.analyze(mission);
      const recommendations = await this.recommendationEngine.generateRecommendations(mission);

      const graph = this.causalGraphEngine.buildGraph(
        mission,
        analysis,
        recommendations.bestOption
      );

      console.log('   ✓ Causal graph built');
      console.log('   ✓ Nodes:', graph.nodes.length);
      console.log('   ✓ Edges:', graph.edges.length);
      console.log('   ✓ Node types:', new Set(graph.nodes.map((n) => n.type)).size);

      if (graph.nodes.length < 5) {
        throw new Error('Insufficient causal graph nodes');
      }

      this.recordTest('Causal Graph Generation', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Causal Graph Generation', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 7: Scenario Generation
   */
  private async testScenarioGeneration(): Promise<boolean> {
    const startTime = Date.now();
    console.log('7️⃣  TEST: Scenario Comparison');

    try {
      const event = {
        eventType: 'CONGESTION',
        timestamp: new Date().toISOString(),
        severity: 'HIGH',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const scenarios = await this.scenarioEngine.generateScenarios(mission);

      console.log('   ✓ Scenarios generated');
      console.log('   ✓ Total scenarios:', scenarios.scenarios.length);
      console.log('   ✓ Recommended:', scenarios.recommended.name);
      console.log('   ✓ Comparison metrics:', Object.keys(scenarios.comparison).length);

      if (scenarios.scenarios.length < 3) {
        throw new Error('Insufficient scenarios');
      }

      this.recordTest('Scenario Comparison', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Scenario Comparison', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 8: Approval Workflow
   */
  private async testApprovalWorkflow(): Promise<boolean> {
    const startTime = Date.now();
    console.log('8️⃣  TEST: Approval Workflow');

    try {
      const event = {
        eventType: 'CRITICAL_OUTAGE',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const gate = await this.approvalWorkflow.startWorkflow(mission);

      console.log('   ✓ Approval gate created');
      console.log('   ✓ Gate ID:', gate.id);
      console.log('   ✓ Status:', gate.status);
      console.log('   ✓ Required role:', gate.requiredRole);

      // Submit approval decision
      const result = await this.approvalGateManager.submitDecision(
        gate.id,
        'operator-123',
        'SENIOR_DISPATCHER',
        'APPROVED',
        'Test approval'
      );

      if (!result.success) {
        throw new Error('Approval submission failed');
      }

      console.log('   ✓ Approval decision recorded');

      this.recordTest('Approval Workflow', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Approval Workflow', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 9: Mission Memory
   */
  private async testMissionMemory(): Promise<boolean> {
    const startTime = Date.now();
    console.log('9️⃣  TEST: Mission Memory & Learning');

    try {
      const event = {
        eventType: 'CRITICAL_OUTAGE',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      };

      const mission = this.missionEngine.createMissionFromEvent(event);
      const analysis = await this.rootCauseEngine.analyze(mission);
      const recommendations = await this.recommendationEngine.generateRecommendations(mission);

      // Record mission
      this.missionMemory.recordMission(
        mission,
        analysis,
        recommendations.bestOption,
        45, // resolution time in minutes
        'SUCCESS'
      );

      console.log('   ✓ Mission recorded in memory');

      // Find similar missions
      const similar = this.missionMemory.findSimilarMissions(mission.type, mission.severity);
      console.log('   ✓ Similar missions found:', similar.length);

      // Get metrics
      const metrics = this.missionMemory.getSuccessMetrics(mission.type);
      console.log('   ✓ Success rate:', (metrics.successRate * 100).toFixed(1), '%');
      console.log('   ✓ Avg resolution time:', metrics.avgResolutionTime, 'minutes');

      this.recordTest('Mission Memory', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Mission Memory', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Test 10: Playbook Recommendation
   */
  private async testPlaybookRecommendation(): Promise<boolean> {
    const startTime = Date.now();
    console.log('🔟 TEST: Playbook Recommendation');

    try {
      // Test various mission types
      const missionTypes = ['CRITICAL_OUTAGE', 'CASCADE_RISK', 'CONGESTION'];

      for (const missionType of missionTypes) {
        const playbook = this.playbooksLibrary.recommendPlaybook(missionType);
        if (!playbook) {
          console.log(`   ⚠️  No playbook for ${missionType}`);
        } else {
          console.log(`   ✓ ${missionType} → ${playbook.name}`);
        }
      }

      // List all playbooks
      const allPlaybooks = this.playbooksLibrary.listPlaybooks();
      console.log('   ✓ Total playbooks available:', allPlaybooks.length);

      this.recordTest('Playbook Recommendation', 'PASS', Date.now() - startTime);
      return true;
    } catch (error) {
      this.recordTest('Playbook Recommendation', 'FAIL', Date.now() - startTime, String(error));
      return false;
    }
  }

  /**
   * Record test result
   */
  private recordTest(
    testName: string,
    status: string,
    duration: number,
    message?: string
  ): void {
    this.testResults.push({
      test: testName,
      status,
      duration,
      message,
    });
  }

  /**
   * Print test summary
   */
  private printTestSummary(): void {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const passed = this.testResults.filter((r) => r.status === 'PASS').length;
    const failed = this.testResults.filter((r) => r.status === 'FAIL').length;
    const total = this.testResults.length;

    this.testResults.forEach((result) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test.padEnd(30)} ${result.duration.toString().padStart(5)}ms`);
      if (result.message) {
        console.log(`   └─ ${result.message}`);
      }
    });

    console.log('\n───────────────────────────────────────────────────────────────');
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  }
}

/**
 * Run tests
 */
export async function runPhase08Tests() {
  const tester = new MissionE2ETest();
  const success = await tester.runFullE2ETest();

  process.exit(success ? 0 : 1);
}
