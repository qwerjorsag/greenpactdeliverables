import React from 'react';
import { SelfAuditGaugeMui } from '../SelfAuditGauge';

type Props = {
  score: number;
  ratingLabel: string;
  show: boolean;
};

export default function SelfAuditSummary({ score, ratingLabel, show }: Props) {
  if (!show) return null;
  return (
    <div className="mt-12 text-center">
      <div className="mt-4" id="self-audit-gauge">
        <SelfAuditGaugeMui score={score} ratingLabel={ratingLabel} />
      </div>
    </div>
  );
}
