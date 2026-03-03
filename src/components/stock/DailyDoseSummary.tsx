import { type FC } from 'react';
import { Sun, Clock, Moon, Pill } from 'lucide-react';
import { Medicine } from '@/types';
import './DailyDoseSummary.css';

interface Props {
  medicines: Medicine[];
}

const DailyDoseSummary: FC<Props> = ({ medicines }) => {
  const morningCount = medicines.filter(m => m.takeMorning).length;
  const noonCount = medicines.filter(m => m.takeAfternoon).length;
  const eveningCount = medicines.filter(m => m.takeEvening).length;
  const totalDoses = morningCount + noonCount + eveningCount;

  if (medicines.length === 0) return null;

  return (
    <div className="glass-card daily-summary-card">
      <div className="daily-summary-left">
        <div className="daily-summary-icon">
          <Pill size={24} />
        </div>
        <div className="daily-summary-stats">
          <p className="daily-summary-total">{totalDoses} <span>doses/day</span></p>
          <p className="daily-summary-subtitle">{medicines.length} unique medicine{medicines.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="daily-summary-right">
        <div className="daily-summary-item morning">
          <div className="daily-summary-item-icon"><Sun size={18} /></div>
          <div className="daily-summary-item-content">
            <p className="daily-summary-item-count">{morningCount}</p>
            <p className="daily-summary-item-label">Morning</p>
          </div>
        </div>
        
        <div className="daily-summary-divider" />
        
        <div className="daily-summary-item noon">
          <div className="daily-summary-item-icon"><Clock size={18} /></div>
          <div className="daily-summary-item-content">
            <p className="daily-summary-item-count">{noonCount}</p>
            <p className="daily-summary-item-label">Noon</p>
          </div>
        </div>
        
        <div className="daily-summary-divider" />
        
        <div className="daily-summary-item evening">
          <div className="daily-summary-item-icon"><Moon size={18} /></div>
          <div className="daily-summary-item-content">
            <p className="daily-summary-item-count">{eveningCount}</p>
            <p className="daily-summary-item-label">Evening</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDoseSummary;
