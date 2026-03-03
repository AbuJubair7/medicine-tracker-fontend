import { type FC, useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { Medicine } from '@/types';
import { calculateMedicineEndDate } from '@/utils/calculateMedicineEndDate';
import './MedicineTimeline.css';

interface Props {
  medicines: Medicine[];
}

const MedicineTimeline: FC<Props> = ({ medicines }) => {
  const timeline = useMemo(() => {
    const items = medicines.map(med => ({ med, endInfo: calculateMedicineEndDate(med) }))
      .filter(item => item.endInfo !== null)
      .sort((a, b) => {
        if (a.endInfo!.alreadyFinished) return 1;
        if (b.endInfo!.alreadyFinished) return -1;
        return a.endInfo!.endDate.getTime() - b.endInfo!.endDate.getTime();
      });
    const maxDays = Math.max(...items.map(i => i.endInfo!.daysLeft || 1), 1);
    return { items, maxDays };
  }, [medicines]);

  if (medicines.length === 0) return null;

  return (
    <div className="glass-card timeline-card">
      <div className="timeline-header">
        <CalendarClock size={20} className="timeline-header-icon" />
        <h3 className="timeline-title">
          Medicine Timeline
          <span className="timeline-subtitle">— when each runs out</span>
        </h3>
      </div>
      
      <div className="timeline-list">
        {timeline.items.map(({ med, endInfo }) => {
          if (!endInfo) return null;
          const barWidth = endInfo.alreadyFinished ? 0 : Math.max(4, (endInfo.daysLeft / timeline.maxDays) * 100);
          
          let statusClass = '';
          let progressClass = '';
          
          if (endInfo.alreadyFinished) {
            statusClass = 'timeline-status-muted';
            progressClass = 'progress-muted';
          } else if (endInfo.daysLeft <= 3) {
            statusClass = 'timeline-status-danger';
            progressClass = 'progress-danger';
          } else if (endInfo.daysLeft <= 7) {
            statusClass = 'timeline-status-warning';
            progressClass = 'progress-warning';
          } else {
            statusClass = 'timeline-status-success';
            progressClass = 'progress-success';
          }

          return (
            <div key={med.id} className="timeline-item">
              <div className="timeline-item-header">
                <div className="timeline-item-info">
                  <span className="timeline-item-name">{med.name}</span>
                  <span className="timeline-item-dose">{med.dose}mg</span>
                </div>
                <div className="timeline-item-status">
                  <span className={`timeline-item-days ${statusClass}`}>
                    {endInfo.alreadyFinished ? 'Finished' : endInfo.daysLeft === 0 ? 'Today' : endInfo.daysLeft === 1 ? 'Tomorrow' : `${endInfo.daysLeft}d`}
                  </span>
                  {!endInfo.alreadyFinished && <span className="timeline-item-label">{endInfo.endTimeLabel}</span>}
                </div>
              </div>
              <div className="timeline-progress-track">
                <div 
                  className={`timeline-progress-bar ${progressClass}`} 
                  style={{ width: `${barWidth}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicineTimeline;
