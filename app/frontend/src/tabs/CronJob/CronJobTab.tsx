import UserConfigBlock from './UserConfigBlock';
import AutoBookingManager from './AutoBookingManager';
import { CronJobProvider, useCronJobContext } from './contexts/CronJobContext';

function CronJobContent() {
  const { editConfig, filteredCronConfigs } = useCronJobContext();

  return (
    <div>
      <h3>Cron Job Configuration</h3>
      <div className="content-box">
        <AutoBookingManager />
        <h4>All Users Configurations</h4>
        {!editConfig.email ? (
          <div>Loading configurations...</div>
        ) : (
          [editConfig, ...filteredCronConfigs].map((config, index) => (
            <UserConfigBlock
              key={config?.email}
              config={index === 0 ? editConfig : config}
              isCurrentUser={index === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function CronJobTab() {
  return (
    <CronJobProvider>
      <CronJobContent />
    </CronJobProvider>
  );
}
