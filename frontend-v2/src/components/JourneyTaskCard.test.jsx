/**
 * Test/Demo file for JourneyTaskCard
 * Shows how to use the card with sample data
 */
import JourneyTaskCard from './JourneyTaskCard';

// Sample journey data matching your "Job Onboarding in Bengaluru" screenshot
const sampleJourney = {
  id: 1,
  name: 'Job Onboarding in Bengaluru',
  description: 'Complete onboarding process for new job in Bengaluru',
  created_at: '2026-03-10T00:00:00Z',
  target_date: '2026-04-01T00:00:00Z',
  tasks: [
    { id: 1, title: 'Complete background verification', done: false, status: 'pending' },
    { id: 2, title: 'Submit identity documents', done: true, status: 'completed' },
    { id: 3, title: 'Complete medical examination', done: true, status: 'completed' },
    { id: 4, title: 'Attend orientation session', done: true, status: 'completed' },
    { id: 5, title: 'BGV background check', done: false, status: 'pending' },
    { id: 6, title: 'Receive employee ID card', done: false, status: 'pending' },
    { id: 7, title: 'Complete IT setup', done: false, status: 'pending' },
    { id: 8, title: 'Meet team members', done: true, status: 'completed' },
    { id: 9, title: 'Review company policies', done: true, status: 'completed' },
    { id: 10, title: 'Set up payroll details', done: true, status: 'completed' },
    { id: 11, title: 'Complete compliance training', done: true, status: 'completed' }
  ]
};

export default function JourneyTaskCardDemo() {
  const handleOpenJourney = (journey) => {
    console.log('Opening journey:', journey);
    alert(`Opening: ${journey.name}`);
  };

  return (
    <div style={{ padding: 40, background: '#0a0f0d', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>
        JourneyTaskCard Demo
      </h1>

      <div style={{ maxWidth: 500 }}>
        <JourneyTaskCard
          journey={sampleJourney}
          onOpenJourney={handleOpenJourney}
        />
      </div>
    </div>
  );
}
