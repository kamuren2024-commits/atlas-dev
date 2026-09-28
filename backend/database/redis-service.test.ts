import { RedisService } from './redis-service';

async function runRedisSuite() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING ENTERPRISE REDIS PLATFORM TEST SUITE');
  console.log('================================================================\n');

  const redis = RedisService.getInstance();
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // 1. Redis Connectivity Check
    const report = await redis.getHealthReport();
    assert(
      report.status === 'CONNECTED' || report.status === 'DEGRADED_FALLBACK',
      `Connectivity status is valid: ${report.status}`
    );

    // 2. Cache Correctness
    console.log('\n--- Testing Caching Layer ---');
    await redis.setCache('test_region', 'key1', { name: 'Atlas V5', enterprise: true });
    const cachedObj = await redis.getCache<{ name: string; enterprise: boolean }>('test_region', 'key1');
    assert(cachedObj !== null && cachedObj.name === 'Atlas V5' && cachedObj.enterprise === true, 'Cache write/read correctness');

    await redis.setCache('test_region', 'ttl_key', 'temporary', 1); // 1 sec TTL
    const beforeTtl = await redis.getCache<string>('test_region', 'ttl_key');
    assert(beforeTtl === 'temporary', 'Cache TTL key readable initially');
    
    // Wait for TTL expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    const afterTtl = await redis.getCache<string>('test_region', 'ttl_key');
    assert(afterTtl === null, 'Cache TTL key expires successfully after 1 second');

    await redis.setCache('test_region', 'key2', 'val2');
    await redis.deleteCache('test_region', 'key1');
    const key1Deleted = await redis.getCache<any>('test_region', 'key1');
    assert(key1Deleted === null, 'Cache key deletion succeeds');

    await redis.clearCacheRegion('test_region');
    const key2Deleted = await redis.getCache<any>('test_region', 'key2');
    assert(key2Deleted === null, 'Cache region clear succeeds');

    // 3. Distributed Locking
    console.log('\n--- Testing Distributed Locks ---');
    const lockKey = 'critical_scm_transaction_resource';
    const token1 = await redis.acquireLock(lockKey, 2000, 500);
    assert(token1 !== null, 'Distributed lock acquired successfully');

    const token2 = await redis.acquireLock(lockKey, 2000, 200);
    assert(token2 === null, 'Concurrent lock request rejected while active');

    const renewed = await redis.renewLock(lockKey, token1!, 3000);
    assert(renewed === true, 'Active lock renewal succeeds with correct owner token');

    const released = await redis.releaseLock(lockKey, token1!);
    assert(released === true, 'Lock released successfully by owner');

    const token3 = await redis.acquireLock(lockKey, 1000, 100);
    assert(token3 !== null, 'Lock acquired again after release');
    await redis.releaseLock(lockKey, token3!);

    // 4. Distributed Pub/Sub
    console.log('\n--- Testing Pub/Sub Messaging ---');
    let messageReceivedPayload: any = null;
    const subId = await redis.subscribe('system:alerts:test', (msg) => {
      messageReceivedPayload = msg;
    });

    // Pause briefly to let subscription register
    await new Promise(resolve => setTimeout(resolve, 100));
    await redis.publish('system:alerts:test', { alert: 'PPADA Regulatory Violation', level: 'CRITICAL' });

    await new Promise(resolve => setTimeout(resolve, 200));
    assert(
      messageReceivedPayload !== null && messageReceivedPayload.alert === 'PPADA Regulatory Violation',
      'Pub/Sub message sent, delivered, and parsed successfully'
    );
    redis.unsubscribe(subId);

    // 5. Enterprise Queuing, Workers, & Priority Processing
    console.log('\n--- Testing Queuing & Background Worker Framework ---');
    const queueName = 'test_jobs';

    // Enqueue 3 jobs with different priorities
    await redis.enqueueJob(queueName, { id: 'job_low', note: 'low priority' }, 0);
    await redis.enqueueJob(queueName, { id: 'job_high', note: 'critical response' }, 10);
    await redis.enqueueJob(queueName, { id: 'job_mid', note: 'normal business' }, 5);

    const sizeBefore = await redis.getQueueSize(queueName);
    assert(sizeBefore === 3, 'Queue sizes reported correctly after multi-enqueue');

    // Dequeue first job, must be 'job_high' due to descending priority sorting
    const firstJob = await redis.dequeueJob(queueName);
    assert(firstJob !== null && firstJob.payload.id === 'job_high', 'Job priority sorting correctness (High priority dequeued first)');

    // Dequeue remaining jobs to clear queue
    const secondJob = await redis.dequeueJob(queueName);
    assert(secondJob !== null && secondJob.payload.id === 'job_mid', 'Second dequeued job is medium priority');
    const thirdJob = await redis.dequeueJob(queueName);
    assert(thirdJob !== null && thirdJob.payload.id === 'job_low', 'Third dequeued job is low priority');

    // 6. Worker Execution and DLQ Triggering
    console.log('\n--- Testing Worker Ingestion & DLQ (Dead Letter Queue) Failover ---');
    const workerQueueName = 'worker_test_queue';
    let processedPayload: any = null;
    let failAttemptCount = 0;

    // Register a worker that processes jobs or fails if payload asks for it
    const workerId = redis.registerWorker(workerQueueName, async (payload) => {
      if (payload.shouldFail) {
        failAttemptCount++;
        throw new Error('Induced OCR contract read error');
      }
      processedPayload = payload;
    }, { concurrency: 1, maxRetries: 2 });

    // Enqueue a successful job
    await redis.enqueueJob(workerQueueName, { task: 'OCR_Ingest', docId: 'doc_102' }, 1);
    await new Promise(resolve => setTimeout(resolve, 800)); // wait for worker cycle
    assert(processedPayload !== null && processedPayload.docId === 'doc_102', 'Worker successfully processed background task');

    // Enqueue a failing job to trigger retries and move to DLQ
    await redis.enqueueJob(workerQueueName, { task: 'OCR_Ingest', docId: 'doc_fail', shouldFail: true }, 5);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for retries + exponential backoff Reschedules

    const dlqSize = await redis.getDLQSize(workerQueueName);
    assert(dlqSize === 1, 'Failed job moved to Dead Letter Queue (DLQ) after retries exhausted');
    assert(failAttemptCount === 2, `Worker retried failing task exactly 2 times before DLQ fallback: ${failAttemptCount}`);

    redis.unregisterWorker(workerId);

    // 7. Concurrent Execution Test
    console.log('\n--- Testing Concurrent Lock Acquisitions ---');
    const concurrentLockKey = 'concurrent_resource';
    const totalRequests = 10;
    const acquisitionPromises = Array.from({ length: totalRequests }).map(() => 
      redis.acquireLock(concurrentLockKey, 1000, 200)
    );

    const results = await Promise.all(acquisitionPromises);
    const successfulAcquisitions = results.filter(res => res !== null);
    
    assert(
      successfulAcquisitions.length === 1,
      `Concurrent request test: Exactly 1 client out of ${totalRequests} acquired the lock exclusively`
    );

    // Clean up successful lock
    await redis.releaseLock(concurrentLockKey, successfulAcquisitions[0]!);

    console.log('\n================================================================');
    console.log(`🏁 TEST SUITE COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('================================================================\n');

    await redis.shutdown();
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('💥 Test suite crashed with exception:', err);
    process.exit(1);
  }
}

runRedisSuite();
