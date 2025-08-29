import { useState } from 'react';
import { Tab } from '../types';
import DesksTab from '../tabs/Desks';
import ReservationsTab from '../tabs/Reservations';
import LogsTab from '../tabs/Logs';
import CronJobTab from '../tabs/CronJob';

function Tabs() {
  const [activeTab, setActiveTab] = useState<string>('cronjob');

  const tabs: Tab[] = [
    { id: 'cronjob', label: 'CronJob', component: CronJobTab },
    { id: 'desks', label: 'Desks', component: DesksTab },
    { id: 'reservations', label: 'Reservations', component: ReservationsTab },
    { id: 'logs', label: 'Logs', component: LogsTab },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content active">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}

export default Tabs;
