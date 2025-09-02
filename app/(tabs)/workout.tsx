import Countdown from '@/components/workout/countdown';
import Routine from '@/components/workout/routine';
import TotalProgress from '@/components/workout/total-progress';

export default function Screen() {
  return (
    <>
      <TotalProgress />
      <Countdown time={10} title="Bicep Curls" next="Pull Ups" />
      <Routine />
    </>
  );
}
