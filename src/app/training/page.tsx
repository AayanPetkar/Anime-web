import { redirect } from 'next/navigation';

// Training always happens against a specific skill (/training/[skillId]).
// Landing here directly (e.g. the navbar/hero "Start Training" link) sends
// you to the catalog to choose one first.
export default function TrainingIndexPage() {
  redirect('/skills');
}
