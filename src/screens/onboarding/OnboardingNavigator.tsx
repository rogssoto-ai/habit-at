import React, { useState } from 'react';
import O1Screen from './O1Screen';
import O2Screen from './O2Screen';
import O3Screen from './O3Screen';

interface Props {
  onDone: () => void;
  tutorialMode?: boolean; // solo muestra O1 y O2
  onTutorialClose?: () => void;
}

export default function OnboardingNavigator({ onDone, tutorialMode, onTutorialClose }: Props) {
  const [step, setStep] = useState(0);

  if (tutorialMode) {
    if (step === 0) return <O1Screen onNext={() => setStep(1)} />;
    return <O2Screen onNext={() => onTutorialClose?.()} onBack={() => setStep(0)} />;
  }

  if (step === 0) return <O1Screen onNext={() => setStep(1)} />;
  if (step === 1) return <O2Screen onNext={() => setStep(2)} onBack={() => setStep(0)} />;
  return <O3Screen onBack={() => setStep(1)} onDone={onDone} />;
}
