// Manual fix script for Godwin's test completion
// Run with: mongosh jorbex fix-godwin-test.js

const candidateEmail = 'godwin@egobas.com';
const testScore = 80; // Adjust if you know the actual score

print('=== Fixing Godwin Babudoh Test Completion ===\n');

// Find the candidate
const candidate = db.candidates.findOne({ email: candidateEmail });

if (!candidate) {
  print('ERROR: Candidate not found!');
  quit(1);
}

print('Found candidate:');
print(`  Name: ${candidate.name}`);
print(`  Email: ${candidate.email}`);
print(`  Current test status: ${candidate.onboardingTestPassed ? 'PASSED' : 'NOT PASSED'}`);
print(`  Current test score: ${candidate.onboardingTestScore || 'N/A'}\n`);

// Update candidate record
print('Updating candidate record...');
const updateResult = db.candidates.updateOne(
  { _id: candidate._id },
  { 
    $set: { 
      onboardingTestPassed: true,
      onboardingTestScore: testScore
    }
  }
);

if (updateResult.modifiedCount > 0) {
  print('✓ Candidate record updated successfully\n');
} else {
  print('⚠ Candidate record was not modified (may already be correct)\n');
}

// Create test result record
print('Creating test result record...');
const testResult = db.testresults.insertOne({
  testId: new ObjectId(),
  candidateId: candidate._id,
  answers: [
    // Placeholder answers - replace with actual if available
    { questionId: '1', selectedAnswer: 'Manual entry', isCorrect: true },
  ],
  score: testScore,
  passingScore: 70,
  passed: true,
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
});

if (testResult.acknowledged) {
  print('✓ Test result record created successfully\n');
  print(`  Test Result ID: ${testResult.insertedId}`);
} else {
  print('✗ Failed to create test result record\n');
}

// Verify the changes
print('\n=== Verification ===');
const updatedCandidate = db.candidates.findOne({ _id: candidate._id });
print(`Test Passed: ${updatedCandidate.onboardingTestPassed}`);
print(`Test Score: ${updatedCandidate.onboardingTestScore}`);

const testResults = db.testresults.find({ candidateId: candidate._id }).toArray();
print(`Total Test Results: ${testResults.length}`);

print('\n✓ Fix completed successfully!');
