
import { useEffect, useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Loader2, Sun, Clock, Moon, CalendarClock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { stockService } from '@/services/stockService';
import { Stock, Medicine } from '@/types';
import { calculateMedicineEndDate, MedicineEndInfo } from '@/utils/calculateMedicineEndDate';
import './Reminders.css';

interface MedicineWithStock extends Medicine { stockName: string; stockId: number; }
interface MedicineReminder { medicine: MedicineWithStock; endInfo: MedicineEndInfo | null; }

const Reminders: FC = () => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockName, setStockName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stockId = searchParams.get('stockId');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const allMeds: MedicineWithStock[] = [];
        if (stockId) {
          const fullStock = await stockService.getOne(stockId);
          setStockName(fullStock.name);
          if (fullStock.medicines) {
            for (const med of fullStock.medicines) allMeds.push({ ...med, stockName: fullStock.name, stockId: fullStock.id });
          }
        } else {
          let page = 1; let hasMore = true;
          while (hasMore) {
            const { data, total } = await stockService.getAll(page, 50);
            for (const stock of data) {
              const fullStock = await stockService.getOne(stock.id);
              if (fullStock.medicines) {
                for (const med of fullStock.medicines) allMeds.push({ ...med, stockName: stock.name, stockId: stock.id });
              }
            }
            hasMore = allMeds.length < total && data.length > 0; page++;
            if (page > 20) break;
          }
        }
        const reminderList: MedicineReminder[] = allMeds.map(med => ({ medicine: med, endInfo: calculateMedicineEndDate(med) }));
        reminderList.sort((a, b) => {
          if (!a.endInfo || a.endInfo.alreadyFinished) return 1;
          if (!b.endInfo || b.endInfo.alreadyFinished) return -1;
          return a.endInfo.endDate.getTime() - b.endInfo.endDate.getTime();
        });
        setReminders(reminderList);
      } catch (err) { console.error('Failed to fetch reminders', err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [stockId]);

  if (loading) return (
    <div className="dashboard-loading" style={{ minHeight: '60vh' }}>
      <Loader2 size={40} color="var(--primary)" className="animate-spin" />
      <p className="loading-text">Calculating medication schedules...</p>
    </div>
  );

  return (
    <div className="reminders-container animate-fade-in">
      <button onClick={() => stockId ? navigate(`/stock/${stockId}`) : navigate('/dashboard')} className="reminders-back-btn">
        <ChevronLeft size={20} /> {stockId ? 'Back to Stock' : 'Back to Dashboard'}
      </button>
      
      <div className="reminders-header">
        <div className="reminders-icon-wrapper"><Bell size={24} /></div>
        <div>
          <h1 className="reminders-title">Reminders</h1>
          <p className="reminders-subtitle">{stockName ? `When medicines in ${stockName} will run out` : 'When your medicines will run out'}</p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="glass-card reminders-empty">
          <div className="reminders-empty-icon"><Bell size={36} /></div>
          <h3 className="reminders-empty-title">No medicines found</h3>
          <p className="reminders-empty-subtitle">Add medicines to your stocks to see when they'll run out.</p>
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map(r => <ReminderCard key={r.medicine.id} reminder={r} onClick={() => navigate(`/stock/${r.medicine.stockId}`)} />)}
        </div>
      )}
    </div>
  );
};

export default Reminders;

function getUrgencyStyle(endInfo: MedicineEndInfo | null) {
  if (!endInfo || endInfo.alreadyFinished) return { containerClass: 'urgency-finished', label: 'Finished' };
  if (endInfo.daysLeft <= 3) return { containerClass: 'urgency-danger', label: 'Urgent' };
  if (endInfo.daysLeft <= 7) return { containerClass: 'urgency-warning', label: 'Soon' };
  return { containerClass: 'urgency-success', label: 'Good' };
}

function getSlotIcon(slot: string) {
  switch (slot) {
    case 'Morning': return <Sun size={16} />;
    case 'Noon': return <Clock size={16} />;
    case 'Evening': return <Moon size={16} />;
    default: return <CalendarClock size={16} />;
  }
}

const ReminderCard = ({ reminder, onClick }: { reminder: MedicineReminder; onClick: () => void }) => {
  const { medicine, endInfo } = reminder;
  const style = getUrgencyStyle(endInfo);
  
  return (
    <div onClick={onClick} className={`reminder-card ${style.containerClass}`}>
      <div className="reminder-card-content">
        <div className="reminder-info">
          <div className="reminder-name-group">
            <h3 className="reminder-name">{medicine.name}</h3>
            <span className="reminder-dose">{medicine.dose} mg</span>
            <span className="reminder-badge">{style.label}</span>
          </div>
          <p className="reminder-details">
            From <span className="reminder-stock-name">{medicine.stockName}</span>
            {' · '}
            <span className={`reminder-qty ${Number(medicine.quantity) <= 5 ? 'qty-danger' : ''}`}>{medicine.quantity} left</span>
          </p>
        </div>
        
        <div className="reminder-meta">
          {endInfo && !endInfo.alreadyFinished ? (
            <>
              <div className="reminder-slot">
                {getSlotIcon(endInfo.endSlot)}
                <span className="reminder-slot-label">{endInfo.endSlot}</span>
              </div>
              <div className="reminder-time-info">
                <p className="reminder-date">{endInfo.endTimeLabel}</p>
                <p className="reminder-days-left">
                  {endInfo.daysLeft === 0 ? 'Finishes today' : endInfo.daysLeft === 1 ? 'Finishes tomorrow' : `${endInfo.daysLeft} days left`}
                </p>
              </div>
            </>
          ) : (
            <div className="reminder-finished">
              <AlertTriangle size={16} />
              <span>Already finished</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
